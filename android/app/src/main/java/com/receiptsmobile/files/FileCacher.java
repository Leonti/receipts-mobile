package com.receiptsmobile.files;

import android.content.Context;
import android.net.Uri;
import android.util.Log;

import java.io.File;
import java.io.InputStream;

import static com.receiptsmobile.InputStreamToFile.streamToFile;

public class FileCacher implements Runnable {
    public interface Callback {
        void onResult(Uri uri);
        void onError(Throwable t);
    }

    private static final String TAG = "FileCacher";

    private final Context context;
    private final String url;
    private final Uri srcFileUri;
    private final Callback callback;

    public FileCacher(Context context, String url, Uri srcFileUri, Callback callback) {
        this.context = context;
        this.url = url;
        this.srcFileUri = srcFileUri;
        this.callback = callback;
    }

    @Override
    public void run() {
        try {
            InputStream inputStream = context.getContentResolver().openInputStream(srcFileUri);
            File dst = new File(context.getCacheDir(), UrlToHash.toHash(url));

            Log.i(TAG, "Caching " + url + " " + dst);
            try {
                streamToFile(inputStream, dst);
                Log.i(TAG, "File was added to cache " + url + " " + dst);
                callback.onResult(Uri.fromFile(dst));
            } finally {
                inputStream.close();
            }
        } catch (Exception e) {
            Log.e(TAG, "Exception while adding file to cache " + url + e, e);
            callback.onError(e);
        }
    }

}
