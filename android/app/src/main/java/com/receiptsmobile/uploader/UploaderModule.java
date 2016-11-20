package com.receiptsmobile.uploader;

import android.content.*;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.os.IBinder;
import android.provider.OpenableColumns;
import android.util.Log;
import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.File;
import java.io.InputStream;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import static com.receiptsmobile.InputStreamToFile.streamToFile;

public class UploaderModule extends ReactContextBaseJavaModule {

    private static String TAG = "UploaderModule";

    @Override
    public String getName() {
        return "ReceiptsUploader";
    }

    private final BroadcastReceiver receiver = createReceiver();

    private UploadService uploadService = null;
    private ServiceConnection serviceConnection = new ServiceConnection() {

        @Override
        public void onServiceConnected(ComponentName componentName, IBinder iBinder) {
            UploadService.UploadServiceBinder binder = (UploadService.UploadServiceBinder) iBinder;
            uploadService = binder.getService();
        }

        @Override
        public void onServiceDisconnected(ComponentName componentName) {
            uploadService = null;
        }
    };

    UploaderModule(ReactApplicationContext reactContext) {
        super(reactContext);

        IntentFilter intentFilter = new IntentFilter(UploadService.RECEIPT_UPLOADED);
        getReactApplicationContext().registerReceiver(receiver, intentFilter);

        getReactApplicationContext().addLifecycleEventListener(new LifecycleEventListener() {
            @Override
            public void onHostResume() {

                Intent intent= new Intent(getReactApplicationContext(), UploadService.class);
                getReactApplicationContext().bindService(intent, serviceConnection,
                        Context.BIND_AUTO_CREATE);

                IntentFilter intentFilter = new IntentFilter(UploadService.RECEIPT_UPLOADED);
                getReactApplicationContext().registerReceiver(receiver, intentFilter);
            }

            @Override
            public void onHostPause() {
                getReactApplicationContext().unbindService(serviceConnection);
                getReactApplicationContext().unregisterReceiver(receiver);
            }

            @Override
            public void onHostDestroy() {

            }
        });
    }

    private BroadcastReceiver createReceiver() {
        return new BroadcastReceiver() {
            @Override
            public void onReceive (Context context, Intent intent){
                Bundle bundle = intent.getExtras();
                String uploadId =  bundle.getString(UploadService.UPLOAD_JOB_ID);
                ReceiptUploader.Result.Status status =
                        ReceiptUploader.Result.Status.valueOf(bundle.getString(UploadService.UPLOAD_JOB_STATUS));
                Log.i(TAG, "BROADCAST RECEIVED " + uploadId + " " + status);

                WritableMap params = Arguments.createMap();
                params.putString("status", status.toString());
                params.putString("uploadId", uploadId);

                if (status == ReceiptUploader.Result.Status.SUCCESS) {
                    params.putString("receiptId", bundle.getString(UploadService.RECEIPT_ID));
                    params.putString("ext", bundle.getString(UploadService.FILE_EXT));
                }

                sendEvent("receiptUploaded", params);
            }
        };
    }

    private void sendEvent(String eventName, WritableMap params) {
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @ReactMethod
    public void submit(ReadableMap payload, Promise promise) {
        Context context = getCurrentActivity();

        String authToken = payload.getString("token");
        String uploadUrl = payload.getString("uploadUrl");

        Set<ReceiptUploader.UploadJob> uploads = new LinkedHashSet<>();
        ReadableArray receipts = payload.getArray("receipts");

        for (int i = 0; i < receipts.size(); i++) {

            ReadableMap receipt = receipts.getMap(i);

            ReceiptUploader.UploadJob job = new ReceiptUploader.UploadJob(
                    UUID.randomUUID(),
                    uploadUrl,
                    authToken,
                    Uri.parse(receipt.getString("uri")),
                    toMap(receipt.getMap("fields")));

            uploads.add(job);
        }

        Intent intent = new Intent(context, UploadService.class);
        context.startService(intent);

        uploadService.upload(uploads);

        WritableMap result = Arguments.createMap();
        WritableArray ids = Arguments.createArray();

        for (ReceiptUploader.UploadJob job : uploads) {
            ids.pushString(job.id.toString());
        }

        result.putArray("jobs", ids);

        promise.resolve(result);
    }

    @ReactMethod
    public void currentUploads(Promise promise) {
        Context context = getCurrentActivity();
        Intent intent = new Intent(context, UploadService.class);
        context.startService(intent);
            
        Set<ReceiptUploader.UploadJob> currentJobs = uploadService.getCurrentJobs();

        WritableMap result = Arguments.createMap();
        WritableArray ids = Arguments.createArray();

        for (ReceiptUploader.UploadJob job : currentJobs) {
            ids.pushString(job.id.toString());
        }

        result.putArray("jobs", ids);
        promise.resolve(result);
    }

    private static Map<String, String> toMap(ReadableMap fields) {
        Map<String, String> map = new HashMap<>();

        ReadableMapKeySetIterator it = fields.keySetIterator();
        while (it.hasNextKey()) {
            String key = it.nextKey();
            map.put(key, fields.getString(key));
        }

        return map;
    }

}
