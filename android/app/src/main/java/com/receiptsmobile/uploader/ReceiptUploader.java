package com.receiptsmobile.uploader;

import android.util.Log;

import java.io.File;
import java.util.concurrent.Callable;

public class ReceiptUploader implements Runnable {

    public interface Callback {
        void onDone(Result result);
    }

    private static String TAG = "ReceiptUploader";
    private final File file;
    private final String authToken;
    private final String uploadUrl;
    private final Callback callback;

    public ReceiptUploader(File file, String authToken, String uploadUrl, Callback callback) {
        this.file = file;
        this.authToken = authToken;
        this.uploadUrl = uploadUrl;
        this.callback = callback;
    }

    public enum Result { SUCCESS, FAILURE }

    @Override
    public void run() {

        try {

            Log.i(TAG, "Uploading file " + file.getAbsolutePath() + " " + authToken + " " + uploadUrl);

            Thread.sleep(5 * 1000);
        } catch (Exception e) {
            Log.e(TAG, "Exception uploading a receipt " + e, e);

            callback.onDone(Result.FAILURE);
        }

        callback.onDone(Result.SUCCESS);
    }



}
