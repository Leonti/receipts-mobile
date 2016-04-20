package com.receiptsmobile.com.receiptsmobile.files;

import android.util.Log;
import com.facebook.react.bridge.*;

import java.io.File;
import java.math.BigInteger;
import java.net.URL;
import java.nio.charset.Charset;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

public class NetworkFilesModule extends ReactContextBaseJavaModule {

    @Override
    public String getName() {
        return "NetworkFiles";
    }

    public NetworkFilesModule(ReactApplicationContext reactContext) {
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
    public void download(
            ReadableMap parameters,
            final Promise promise) {

        try {

            boolean forceRedownload = parameters.hasKey("force") ?
                    parameters.getBoolean("force") : false;
            String url = parameters.getString("url");
            ReadableMap headers = parameters.hasKey("headers") ?
                    parameters.getMap("headers") :
                    Arguments.createMap();

            final File dst = new File(getCacheDir(), urlToHash(url));

            if (dst.exists() && forceRedownload == false) {
                WritableMap result = Arguments.createMap();
                result.putString("file", dst.getAbsolutePath());
                result.putInt("length", new Long(dst.length()).intValue());
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

    private static String md5(String s) {
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            digest.update(s.getBytes(Charset.forName("US-ASCII")),0,s.length());
            byte[] magnitude = digest.digest();
            BigInteger bi = new BigInteger(1, magnitude);
            String hash = String.format("%0" + (magnitude.length << 1) + "x", bi);
            return hash;
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

}
