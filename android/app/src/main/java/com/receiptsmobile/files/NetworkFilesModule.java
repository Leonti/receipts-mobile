package com.receiptsmobile.files;

import android.net.Uri;
import android.util.Log;
import com.facebook.react.bridge.*;

import java.io.*;
import java.math.BigInteger;
import java.net.URL;
import java.nio.charset.Charset;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import static com.receiptsmobile.InputStreamToFile.streamToFile;

class NetworkFilesModule extends ReactContextBaseJavaModule {

    private static String TAG = "NetworkFilesModule";

    private ExecutorService executor = Executors.newCachedThreadPool();

    @Override
    public String getName() {
        return "NetworkFiles";
    }

    NetworkFilesModule(ReactApplicationContext reactContext) {
        super(reactContext);
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

            ExecutorService executor = Executors.newSingleThreadExecutor();

            try {
                FileDownloader downloader = new FileDownloader(new DownloadParams(
                        new URL(url),
                        readableMapToMap(headers),
                        dst,
                        new DownloadParams.OnDownloadCompleted() {
                            @Override
                            public void onDownloadCompleted(DownloadResult res) {
                                if (res.exception != null) {
                                    promise.reject(res.exception);
                                } else {
                                    WritableMap result = Arguments.createMap();
                                    result.putString("file", dst.getAbsolutePath());
                                    result.putInt("length", Long.valueOf(res.bytesWritten).intValue());
                                    result.putInt("statusCode", res.statusCode);
                                    result.putBoolean("wasCached", true);
                                    promise.resolve(result);
                                }
                            }
                        }
                ));


                executor.submit(downloader);
            } finally {
                executor.shutdown();
            }
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void addToCache(ReadableMap parameters, final Promise promise) {

        try {

            String url = parameters.getString("url");
            Uri fileUri = Uri.parse(parameters.getString("file"));

            Log.i(TAG, "Adding file to cache " + url + " " + fileUri);

            executor.submit(new FileCacher(getCurrentActivity(), url, fileUri, new FileCacher.Callback() {

                @Override
                public void onResult(Uri uri) {
                    WritableMap result = Arguments.createMap();
                    result.putString("uri", uri.toString());
                    promise.resolve(result);
                }

                @Override
                public void onError(Throwable t) {
                    promise.reject(t);
                }
            }));
        } catch (Exception e) {
            promise.reject(e);
        }
    }

}
