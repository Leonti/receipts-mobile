package com.receiptsmobile.uploader;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.OpenableColumns;
import android.util.Log;
import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.File;
import java.io.InputStream;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static com.receiptsmobile.InputStreamToFile.streamToFile;

public class UploaderModule extends ReactContextBaseJavaModule {

    private static String TAG = "UploaderModule";

    @Override
    public String getName() {
        return "ReceiptsUploader";
    }

    private final BroadcastReceiver receiver = createReceiver();

    UploaderModule(ReactApplicationContext reactContext) {
        super(reactContext);

        IntentFilter intentFilter = new IntentFilter(UploadService.RECEIPT_UPLOADED);
        getReactApplicationContext().registerReceiver(receiver, intentFilter);

        getReactApplicationContext().addLifecycleEventListener(new LifecycleEventListener() {
            @Override
            public void onHostResume() {
                IntentFilter intentFilter = new IntentFilter(UploadService.RECEIPT_UPLOADED);
                getReactApplicationContext().registerReceiver(receiver, intentFilter);
            }

            @Override
            public void onHostPause() {
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
                String receiptId = bundle.getString(UploadService.RECEIPT_ID);
                Log.i(TAG, "BROADCAST RECEIVED " + receiptId);

                WritableMap params = Arguments.createMap();
                params.putString("receiptId", receiptId);
                params.putString("fileId", bundle.getString(UploadService.FILE_ID));
                params.putString("uri", bundle.getString(UploadService.URI));
                params.putString("ext", bundle.getString(UploadService.FILE_EXT));
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

        String token = payload.getString("token");
        String url = payload.getString("uploadUrl");

        Set<String> uploads = new HashSet<>();
        ReadableArray contentUris = payload.getArray("files");

        for (int i = 0; i < contentUris.size(); i++) {
            uploads.add(contentUris.getString(i));
        }

        new UploadJobsStorage(context).submitUploads(uploads, token, url);

        Intent intent = new Intent(context, UploadService.class);
        context.startService(intent);

        promise.resolve("started");
    }


}
