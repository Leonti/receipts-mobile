package com.receiptsmobile.com.receiptsmobile.files;

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

class NetworkFilesModule extends ReactContextBaseJavaModule {

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

    private String urlToHash(String url) {
        return md5(url);
    }

    @ReactMethod
    public void download(ReadableMap parameters, final Promise promise) {

        try {

            boolean forceRedownload = parameters.hasKey("force") && parameters.getBoolean("force");
            String url = parameters.getString("url");
            ReadableMap headers = parameters.hasKey("headers") ?
                    parameters.getMap("headers") :
                    Arguments.createMap();

            final File dst = new File(getCacheDir(), urlToHash(url));

            if (dst.exists() && !forceRedownload) {
                WritableMap result = Arguments.createMap();
                result.putString("file", dst.getAbsolutePath());
                result.putInt("length", Long.valueOf(dst.length()).intValue());
                result.putBoolean("wasCached", true);

                Log.i("NETWORK FILES", "File for '" + url + "' is cached, returning");
                promise.resolve(result);
                return;
            }

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
                                result.putInt("length", res.bytesWritten);
                                result.putInt("statusCode", res.statusCode);
                                result.putBoolean("wasCached", true);
                                promise.resolve(result);
                            }
                        }
                    }
            ));

            downloader.execute();
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void addToCache(ReadableMap parameters, final Promise promise) {

        try {

            String url = parameters.getString("url");
            Uri file = Uri.parse(parameters.getString("file"));

            InputStream inputStream = getCurrentActivity().getContentResolver().openInputStream(file);
            File dst = new File(getCacheDir(), urlToHash(url));

            inputStreamToFile(inputStream, dst);

            promise.resolve(dst.getAbsolutePath());
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    private static void inputStreamToFile(InputStream inputStream, File dst) throws IOException {
        try {
            OutputStream output = new FileOutputStream(dst);
            try {
                try {
                    byte[] buffer = new byte[4 * 1024]; // or other buffer size
                    int read;

                    while ((read = inputStream.read(buffer)) != -1) {
                        output.write(buffer, 0, read);
                    }
                    output.flush();
                } finally {
                    output.close();
                }
            } catch (Exception e) {
                e.printStackTrace(); // handle exception, define IOException and others
            }
        } finally {
            inputStream.close();
        }
    }

    private static String md5(String s) {
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            digest.update(s.getBytes(Charset.forName("US-ASCII")),0,s.length());
            byte[] magnitude = digest.digest();
            BigInteger bi = new BigInteger(1, magnitude);
            return String.format("%0" + (magnitude.length << 1) + "x", bi);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

}
