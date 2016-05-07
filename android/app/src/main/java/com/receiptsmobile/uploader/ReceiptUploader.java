package com.receiptsmobile.uploader;

import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;
import android.util.Log;
import com.facebook.react.modules.network.OkHttpClientProvider;
import com.squareup.okhttp.*;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

import static com.receiptsmobile.InputStreamToFile.streamToFile;

public class ReceiptUploader implements Runnable {

    public interface Callback {
        void onDone(Result result);
    }

    private static String TAG = "ReceiptUploader";
    private final Context context;
    private final Uri uri;
    private final String authToken;
    private final String uploadUrl;
    private final Callback callback;

    public ReceiptUploader(Context context, Uri uri, String authToken, String uploadUrl, Callback callback) {
        this.context = context;
        this.uri = uri;
        this.authToken = authToken;
        this.uploadUrl = uploadUrl;
        this.callback = callback;
    }

    public static class Result {
        public enum Status { SUCCESS, FAILURE };

        public final Status status;
        public final String receiptId;
        public final String fileId;
        public final File file;

        private Result(Status status, String receiptId, String fileId, File file) {
            this.status = status;
            this.receiptId = receiptId;
            this.fileId = fileId;
            this.file = file;
        }

        public static Result success(String receiptId, String fileId, File file) {
            return new Result(Status.SUCCESS, receiptId, fileId, file);
        }

        public static Result failure() {
            return new Result(Status.FAILURE, null, null, null);
        }
    }

    @Override
    public void run() {

        try {
            Log.i(TAG, "Converting uri into a file");
            final File file = contentUriToFile(context, uri);

            // http://stackoverflow.com/questions/24279563/uploading-a-large-file-in-multipart-using-okhttp
            Log.i(TAG, "Uploading file " + file.getAbsolutePath() + " " + authToken + " " + uploadUrl);

            OkHttpClient client = OkHttpClientProvider.getOkHttpClient();

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

            client.newCall(request).enqueue(new com.squareup.okhttp.Callback() {
                @Override
                public void onFailure(Request request, IOException e) {
                    Log.e(TAG, "Exception uploading a receipt (onFailure) " + e, e);
                    callback.onDone(Result.failure());
                }

                @Override
                public void onResponse(Response response) throws IOException {
                    String responseBody = response.body().string();
                    Log.i(TAG, responseBody);

                    try {
                        if (response.isSuccessful()) {

                            JSONObject json = new JSONObject(responseBody);

                            JSONArray files = json.getJSONArray("files");
                            JSONObject jsonFile = files.getJSONObject(0);

                            callback.onDone(Result.success(json.getString("id"), jsonFile.getString("id"), file));
                        } else {
                            callback.onDone(Result.failure());
                            Log.i(TAG, "Invalid response " + response.code());
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Exception uploading a receipt (decoding JSON)" + e, e);
                        callback.onDone(Result.failure());
                    }

                }
            });

//Thread.sleep(1000);
   //         callback.onDone(Result.success("some-receipt-id"));
        } catch (Exception e) {
            Log.e(TAG, "Exception uploading a receipt (general)" + e, e);
            callback.onDone(Result.failure());
        }
    }

    private static String contentUriToFileExtension(Context context, Uri uri) {
        Cursor cursor = null;
        try {

            cursor = context.getContentResolver().query(uri, null, null, null, null);
            cursor.moveToFirst();
            int nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);

            String fileName = cursor.getString(nameIndex);
            String[] splitted = fileName.split("\\.");
            return splitted.length > 0 ? splitted[splitted.length -1] : "";
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
    }

    private static File contentUriToFile(Context context, Uri uri) {

        try {
            InputStream inputStream = context.getContentResolver().openInputStream(uri);
            File dst = new File(context.getCacheDir(),
                    UUID.randomUUID().toString() + "." + contentUriToFileExtension(context, uri));

            try {
                return streamToFile(inputStream, dst);
            } finally {
                inputStream.close();
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


}
