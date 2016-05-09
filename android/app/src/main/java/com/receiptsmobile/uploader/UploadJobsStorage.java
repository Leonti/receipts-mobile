package com.receiptsmobile.uploader;

import android.content.Context;
import android.content.SharedPreferences;
import android.net.Uri;
import android.util.Log;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.*;

public class UploadJobsStorage {
    private static final String SHARED_PREFERENCES_NAME= "UPLOADS";
    private static final String UPLOAD_JOBS= "UPLOAD_JOBS";

    private final Context context;

    public UploadJobsStorage(Context context) {
        this.context = context;
    }

    public void submitUploads(List<ReceiptUploader.UploadJob> jobs) {

        Log.i("UploadJobsStorage", "UploadJobs to submit: ");
        for (ReceiptUploader.UploadJob job : jobs) {
            Log.i("UploadJobsStorage", "" + job);
        }

        List<ReceiptUploader.UploadJob> existingJobs = getUploadJobs();
        existingJobs.addAll(jobs);

        List<ReceiptUploader.UploadJob> toUpload = new LinkedList<>(new LinkedHashSet<>(existingJobs));

        saveUploads(toUpload);
    }

    public List<ReceiptUploader.UploadJob> getUploadJobs() {
        return fromJsonString(getSharedPreferences().getString(UPLOAD_JOBS, "[]"));
    }

    public void removeUpload(ReceiptUploader.UploadJob job) {

        List<ReceiptUploader.UploadJob> uploads = getUploadJobs();
        uploads.remove(job);
        saveUploads(uploads);
    }

    private void saveUploads(List<ReceiptUploader.UploadJob> uploads) {
        SharedPreferences.Editor editor = getSharedPreferences().edit();
        editor.putString(UPLOAD_JOBS, toJsonString(uploads));
        editor.commit();
    }

    private SharedPreferences getSharedPreferences() {
        return context.getSharedPreferences(SHARED_PREFERENCES_NAME, 0);
    }

    private List<ReceiptUploader.UploadJob> fromJsonString(String jsonString) {
        List<ReceiptUploader.UploadJob> jobs = new LinkedList<>();

        try {
            JSONArray json = new JSONArray(jsonString);


            for (int i = 0; i < json.length(); i++) {
                jobs.add(toUploadJob(json.getJSONObject(i)));
            }

            return jobs;
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    private String toJsonString(List<ReceiptUploader.UploadJob> jobs) {
        JSONArray json = new JSONArray();

        for (ReceiptUploader.UploadJob job : jobs) {
            json.put(toJsonObject(job));
        }

        try {
            return json.toString(4);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    private JSONObject toJsonObject(ReceiptUploader.UploadJob job) {

        JSONObject json = new JSONObject();
        try {
            json.put("id", job.id);
            json.put("uploadUrl", job.uploadUrl);
            json.put("authToken", job.authToken);
            json.put("fileUri", job.fileUri.toString());
            json.put("fields", new JSONObject(job.fields));

            return json;
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    private ReceiptUploader.UploadJob toUploadJob(JSONObject json) {
        try {
            return new ReceiptUploader.UploadJob(
                    UUID.fromString(json.getString("id")),
                    json.getString("uploadUrl"),
                    json.getString("authToken"),
                    Uri.parse(json.getString("fileUri")),
                    toMap(json.getJSONObject("fields"))
            );

        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    private Map<String, String> toMap(JSONObject json) {
        try {
            Map<String, String> map = new HashMap<>();

            Iterator<String> it = json.keys();
            while (it.hasNext()) {
                String key = it.next();
                map.put(key, json.getString(key));
            }

            return map;
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }
}
