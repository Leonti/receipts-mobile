package com.receiptsmobile.uploader;

import android.content.Context;
import android.content.SharedPreferences;

import java.util.HashSet;
import java.util.Set;

public class UploadJobsStorage {
    private static final String SHARED_PREFERENCES_NAME= "UPLOADS";
    private static final String FILES_KEY= "FILES";

    private final Context context;

    public UploadJobsStorage(Context context) {
        this.context = context;
    }

    public void submitUploads(Set<String> files) {

        SharedPreferences storage = context.getSharedPreferences(SHARED_PREFERENCES_NAME, 0);

        SharedPreferences.Editor editor = storage.edit();
        editor.putStringSet(FILES_KEY, files);
        editor.commit();
    }

    public Set<String> getUploads() {
        SharedPreferences storage = context.getSharedPreferences(SHARED_PREFERENCES_NAME, 0);
        return storage.getStringSet(FILES_KEY, new HashSet<String>());
    }
}
