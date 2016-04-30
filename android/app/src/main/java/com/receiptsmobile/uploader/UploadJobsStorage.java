package com.receiptsmobile.uploader;

import android.content.Context;
import android.content.SharedPreferences;

import java.util.HashSet;
import java.util.Set;

public class UploadJobsStorage {
    private static final String SHARED_PREFERENCES_NAME= "UPLOADS";
    private static final String FILES_KEY= "FILES";
    private static final String TOKEN_KEY = "TOKEN";
    private static final String UPLOAD_URL_KEY = "UPLOAD_URL";

    private final Context context;

    public UploadJobsStorage(Context context) {
        this.context = context;
    }

    public void submitUploads(Set<String> files, String token, String uploadUrl) {
        SharedPreferences.Editor editor = getSharedPreferences().edit();
        editor.putStringSet(FILES_KEY, files);
        editor.putString(TOKEN_KEY, token);
        editor.putString(UPLOAD_URL_KEY, uploadUrl);
        editor.commit();
    }

    public Set<String> getUploads() {
        return getSharedPreferences().getStringSet(FILES_KEY, new HashSet<String>());
    }

    public String getAuthToken() {
        return getSharedPreferences().getString(TOKEN_KEY, "EMPTY TOKEN");
    }

    public String getUploadUrl() {
        return getSharedPreferences().getString(UPLOAD_URL_KEY, "EMPTY URL");
    }

    private SharedPreferences getSharedPreferences() {
        return context.getSharedPreferences(SHARED_PREFERENCES_NAME, 0);
    }
}
