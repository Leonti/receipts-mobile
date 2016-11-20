package com.receiptsmobile.uploader;

import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;
import android.util.Log;
import com.facebook.react.modules.network.OkHttpClientProvider;
import okhttp3.*;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.UUID;

import static com.receiptsmobile.InputStreamToFile.streamToFile;

public class ReceiptUploader implements Runnable {

    private static String TAG = "ReceiptUploader";
    private final Context context;
    private final UploadJob job;
    private final Callback callback;

    public ReceiptUploader(
            Context context,
            UploadJob job,
            Callback callback) {
        this.context = context;
        this.job = job;
        this.callback = callback;
    }

    public static class Result {
        public enum Status { SUCCESS, FAILURE };

        public final Status status;
        public final String receiptId;
        public final File file;

        private Result(Status status, String receiptId, File file) {
            this.status = status;
            this.receiptId = receiptId;
            this.file = file;
        }

        public static Result success(String receiptId, File file) {
            return new Result(Status.SUCCESS, receiptId, file);
        }

        public static Result failure() {
            return new Result(Status.FAILURE, null, null);
        }
    }

    @Override
    public void run() {

        try {
            Log.i(TAG, "Converting uri into a file " + job.fileUri);
            final File file = contentUriToFile(context, job.fileUri);

            // http://stackoverflow.com/questions/24279563/uploading-a-large-file-in-multipart-using-okhttp
            Log.i(TAG, "Uploading file " + file.getAbsolutePath() + " " + job.authToken + " " + job.uploadUrl);

            OkHttpClient client = OkHttpClientProvider.getOkHttpClient();

            MultipartBody.Builder requestBuilder = new MultipartBody.Builder()
                    .setType(MultipartBody.FORM)
                    .addFormDataPart("receipt", file.getName(), RequestBody.create(MediaType.parse("image/jpeg"), file));

            for (String key : job.fields.keySet()) {
                requestBuilder.addFormDataPart(key, job.fields.get(key));
            }

            Request request = new Request.Builder()
                    .header("Authorization", "Bearer " + job.authToken)
                    .url(job.uploadUrl)
                    .post(requestBuilder.build())
                    .build();

            try {
                Response response = client.newCall(request).execute();
                String responseBody = response.body().string();
                Log.i(TAG, responseBody);

                try {
                    if (response.isSuccessful()) {

                        JSONObject json = new JSONObject(responseBody);
                        callback.onDone(Result.success(json.getString("id"), file));
                    } else {
                        callback.onDone(Result.failure());
                        Log.i(TAG, "Invalid response " + response.code());
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Exception uploading a receipt (decoding JSON)" + e, e);
                    callback.onDone(Result.failure());
                }
            } catch (IOException e) {
                Log.e(TAG, "Exception uploading a receipt (onFailure) " + e, e);
                callback.onDone(Result.failure());
            } finally {
                file.delete();
            }
        } catch (Exception e) {
            Log.e(TAG, "Exception uploading a receipt (general)" + e, e);
            callback.onDone(Result.failure());
        }
    }

    private static String contentUriToFileExtension(Context context, Uri uri) {
        Cursor cursor = null;
        try {

            if (uri.toString().startsWith("file://")) {
                return filePathToExtension(uri.toString().replace("file://", ""));
            }

            cursor = context.getContentResolver().query(uri, null, null, null, null);

            if (cursor == null) {
                Log.w(TAG, "Returning default 'jpg' for " + uri);
                return "jpg";
            }

            cursor.moveToFirst();
            int nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);

            return filePathToExtension(cursor.getString(nameIndex));
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
    }

    private static String filePathToExtension(String filePath) {
        String[] splitted = filePath.split("\\.");
        return splitted.length > 0 ? splitted[splitted.length -1] : "";
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

    static class UploadJob {
        public final UUID id;
        public final String uploadUrl;
        public final String authToken;
        public final Uri fileUri;
        Map<String, String> fields;

        public UploadJob(UUID id, String uploadUrl, String authToken, Uri fileUri, Map<String, String> fields) {
            this.id = id;
            this.uploadUrl = uploadUrl;
            this.authToken = authToken;
            this.fileUri = fileUri;
            this.fields = fields;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;

            UploadJob uploadJob = (UploadJob) o;

            if (!uploadUrl.equals(uploadJob.uploadUrl)) return false;
            if (!fileUri.equals(uploadJob.fileUri)) return false;
            return fields.equals(uploadJob.fields);
        }

        @Override
        public int hashCode() {
            int result = uploadUrl.hashCode();
            result = 31 * result + fileUri.hashCode();
            result = 31 * result + fields.hashCode();
            return result;
        }

        @Override
        public String toString() {
            return "UploadJob{" +
                    "id=" + id +
                    ", uploadUrl='" + uploadUrl + '\'' +
                    ", authToken='" + authToken + '\'' +
                    ", fileUri=" + fileUri +
                    ", fields=" + fields +
                    '}';
        }
    }

    interface Callback {
        void onDone(Result result);
    }
}
