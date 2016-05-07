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
import com.receiptsmobile.files.FileCacher;

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

    private ExecutorService executor = Executors.newSingleThreadExecutor();

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
    public void submitMultiple(ReadableMap payload, Promise promise) {
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

    @ReactMethod
    public void submitSingle(ReadableMap payload, final Promise promise) {
        final Context context = getCurrentActivity();

        String token = payload.getString("token");
        final String url = payload.getString("uploadUrl");
        final Uri uri = Uri.parse(payload.getString("uri"));
        ReadableMap fields = payload.getMap("fields");

        executor.submit(new ReceiptUploader(
                context,
                uri,
                token,
                url,
                toMap(fields),
                new ReceiptUploader.Callback() {
                    @Override
                    public void onDone(ReceiptUploader.Result result) {

                        if (result.status == ReceiptUploader.Result.Status.SUCCESS) {
                            String fileUrl = appendSlash(url) + result.receiptId + "/file/" + result.fileId + "." + toExt(result.file);
                            cacheFile(context, fileUrl, uri, new FileCacher.Callback() {
                                @Override
                                public void onResult(Uri uri) {
                                    WritableMap result = Arguments.createMap();
                                    result.putString("status", "SUCCESS");
                                    promise.resolve(result);
                                }

                                @Override
                                public void onError(Throwable t) {
                                    WritableMap result = Arguments.createMap();
                                    result.putString("status", "CACHING_ERROR");
                                    promise.resolve(result);
                                }
                            });
                        } else {
                            promise.reject("UPLOAD_FAILED", "Failed to upload file to " + url);
                        }
                    }
                }));
    }

    private String toExt(File file) {
        String[] splitted = file.getName().split("\\.");
        return splitted.length > 0 ? splitted[splitted.length -1] : "";
    }

    private void cacheFile(Context context, String url, Uri srcFileUri, FileCacher.Callback callback) {
        new FileCacher(context, url, srcFileUri, callback).run();
    }

    private static String appendSlash(String url) {
        return url.lastIndexOf("/") == url.length() - 1 ? url : url + "/";
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
