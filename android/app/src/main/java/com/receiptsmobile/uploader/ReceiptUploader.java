package com.receiptsmobile.uploader;

import android.util.Log;
import com.squareup.okhttp.*;
import org.json.JSONObject;

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

    public static class Result {
        public enum Status { SUCCESS, FAILURE };

        public final Status status;
        public final String receiptId;

        private Result(Status status, String receiptId) {
            this.status = status;
            this.receiptId = receiptId;
        }

        public static Result success(String receiptId) {
            return new Result(Status.SUCCESS, receiptId);
        }

        public static Result failure() {
            return new Result(Status.FAILURE, null);
        }
    }

    @Override
    public void run() {

        try {

            // http://stackoverflow.com/questions/24279563/uploading-a-large-file-in-multipart-using-okhttp
            Log.i(TAG, "Uploading file " + file.getAbsolutePath() + " " + authToken + " " + uploadUrl);

            OkHttpClient client = new OkHttpClient();

            RequestBody requestBody = new MultipartBuilder()
                    .type(MultipartBuilder.FORM)
                    .addFormDataPart("total", "")
                    .addFormDataPart("description", "")
                    .addFormDataPart("receipt", file.getName(), RequestBody.create(MediaType.parse("image/jpeg"), file))
                    .build();

            Request request = new Request.Builder()
                    .header("Authorization", "Bearer " + authToken)
                    .url(uploadUrl)
                    .post(requestBody)
                    .build();

            Response response = client.newCall(request).execute();
            String responseBody = response.body().string();
            Log.i(TAG, responseBody);

            if (response.isSuccessful()) {

                JSONObject json = new JSONObject(responseBody);
                callback.onDone(Result.success(json.getString("id")));
            } else {
                callback.onDone(Result.failure());
                Log.i(TAG, "Invalid response " + response.code());
            }


//Thread.sleep(1000);
   //         callback.onDone(Result.success("some-receipt-id"));
        } catch (Exception e) {
            Log.e(TAG, "Exception uploading a receipt " + e, e);
            callback.onDone(Result.failure());
        }
    }



}
