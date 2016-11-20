package com.receiptsmobile.files;

import android.content.*;
import android.net.Uri;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;
import com.facebook.common.internal.Sets;
import com.facebook.react.bridge.*;
import com.receiptsmobile.uploader.ReceiptUploader;
import com.receiptsmobile.uploader.UploadService;

import java.io.*;
import java.net.URL;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

class NetworkFilesModule extends ReactContextBaseJavaModule {

    private static String TAG = "NetworkFilesModule";

    private static class PromiseHolder {
        public final String dst;
        public final Promise promise;

        PromiseHolder(String dst, Promise promise) {
            this.dst = dst;
            this.promise = promise;
        }
    }

    private final Set<PromiseHolder> promises = Collections.newSetFromMap(new ConcurrentHashMap<PromiseHolder, Boolean>());

    @Override
    public String getName() {
        return "NetworkFiles";
    }

    private final BroadcastReceiver receiver = createReceiver();
    private DownloadService downloadService = null;
    private ServiceConnection serviceConnection = new ServiceConnection() {

        @Override
        public void onServiceConnected(ComponentName componentName, IBinder iBinder) {
            DownloadService.DownloadServiceBinder binder = (DownloadService.DownloadServiceBinder) iBinder;
            downloadService = binder.getService();
        }

        @Override
        public void onServiceDisconnected(ComponentName componentName) {
            downloadService = null;
        }
    };

    NetworkFilesModule(ReactApplicationContext reactContext) {
        super(reactContext);

        IntentFilter intentFilter = new IntentFilter(DownloadService.FILE_DOWNLOADED);
        getReactApplicationContext().registerReceiver(receiver, intentFilter);

        getReactApplicationContext().addLifecycleEventListener(new LifecycleEventListener() {
            @Override
            public void onHostResume() {

                Intent intent= new Intent(getReactApplicationContext(), DownloadService.class);
                getReactApplicationContext().bindService(intent, serviceConnection,
                        Context.BIND_AUTO_CREATE);

                IntentFilter intentFilter = new IntentFilter(DownloadService.FILE_DOWNLOADED);
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
                String dst =  bundle.getString(DownloadService.FILE_DST);
                DownloadService.DownloadStatus status = DownloadService.DownloadStatus.valueOf(bundle.getString(DownloadService.FILE_DOWNLOADED_STATUS));
                Log.i(TAG, "BROADCAST RECEIVED " + dst + " " + status);

                Set<PromiseHolder> toDelete = Sets.newHashSet();

                for (PromiseHolder promiseHolder : promises) {
                    if (promiseHolder.dst.equals(dst)) {
                        toDelete.add(promiseHolder);

                        WritableMap result = Arguments.createMap();
                        if (status == DownloadService.DownloadStatus.SUCCESS) {
                            result.putString("file", dst);
                          //  result.putInt("length", Long.valueOf(bundle.getString(DownloadService.FILE_SIZE)).intValue());
                            result.putBoolean("wasCached", false);

                            Log.i(TAG, "Resolving a promise " + dst);
                            promiseHolder.promise.resolve(result);
                        } else {
                            promiseHolder.promise.reject(new RuntimeException("File for '" + dst + "' failed to download"));
                            Log.i(TAG, "File for '" + dst + "' failed to download");
                        }
                    }
                }

                promises.removeAll(toDelete);
            }
        };
    }

    private String getCacheDir() {
        return getReactApplicationContext().getCacheDir().getAbsolutePath();
    }

    private Map<String, String> readableMapToMap(ReadableMap readableMap) {
        Map<String, String> map = new HashMap<String, String>();

        ReadableMapKeySetIterator iterator = readableMap.keySetIterator();
        while (iterator.hasNextKey()) {

            String key = iterator.nextKey();
            map.put(key, readableMap.getString(key));
        }

        return map;
    }

    @ReactMethod
    public void download(ReadableMap parameters, final Promise promise) {
        long start = System.currentTimeMillis();

        Context context = getCurrentActivity();

        try {

            boolean forceRedownload = parameters.hasKey("force") && parameters.getBoolean("force");
            String url = parameters.getString("url");
            ReadableMap headers = parameters.hasKey("headers") ?
                    parameters.getMap("headers") :
                    Arguments.createMap();

            final File dst = new File(getCacheDir(), UrlToHash.toHash(url));
            Log.i(TAG, "Downloading '" + url + "', looking for cache at " + dst.getAbsolutePath());

            if (dst.exists() && !forceRedownload) {
                WritableMap result = Arguments.createMap();
                result.putString("file", dst.getAbsolutePath());
                result.putInt("length", Long.valueOf(dst.length()).intValue());
                result.putBoolean("wasCached", true);

                Log.i(TAG, "File for '" + url + "' is cached, returning");
                promise.resolve(result);
                return;
            }

            Intent intent = new Intent(context, DownloadService.class);
            context.startService(intent);

            promises.add(new PromiseHolder(dst.getAbsolutePath(), promise));

            DownloadJob downloadJob = new DownloadJob(
                    UUID.randomUUID(),
                    url,
                    readableMapToMap(headers),
                    dst.getAbsolutePath()
            );

            downloadService.download(downloadJob);
        } catch (Exception e) {
            promise.reject(e);
        }

        long end = System.currentTimeMillis();

        Log.i(TAG, "Took " + (end - start) + "ms to submit a job");
    }

}
