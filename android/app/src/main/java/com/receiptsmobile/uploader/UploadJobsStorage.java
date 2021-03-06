package com.receiptsmobile.uploader;

import android.content.ContentValues;
import android.content.Context;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.database.DatabaseUtils;
import android.database.sqlite.SQLiteDatabase;
import android.net.Uri;
import android.util.Log;
import com.receiptsmobile.db.UploadJobEntryDbHelper;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import com.receiptsmobile.db.UploadJobEntryContract.*;

import java.io.Closeable;
import java.util.*;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class UploadJobsStorage implements Closeable {

    public static class Count {
        public final long completed;
        public final long pending;
        public final long total;

        public Count(long completed, long pending) {
            this.completed = completed;
            this.pending = pending;
            this.total = completed + pending;
        }
    }

    private final SQLiteDatabase db;
    private final Lock lock = new ReentrantLock();

    public UploadJobsStorage(Context context) {
        db = new UploadJobEntryDbHelper(context).getWritableDatabase();
    }

    public void submitUploads(Set<ReceiptUploader.UploadJob> jobs) {
        lock.lock();
        try {
            long start = System.currentTimeMillis();
            db.beginTransaction();
            for (ReceiptUploader.UploadJob job : jobs) {
                Log.i("UploadJobsStorage", "Submitting: " + job.id);
                db.insert(UploadJobEntry.TABLE_NAME, null, toContentValues(job));
            }
            db.setTransactionSuccessful();
            db.endTransaction();

            long end = System.currentTimeMillis();

            Log.i("UploadJobsStorage", "Time taken to submit jobs: " + ((end - start)/1000) + "s");
        } finally {
            lock.unlock();
        }
    }

    public Set<ReceiptUploader.UploadJob> getUploadJobs() {
        lock.lock();
        try {
            String[] projection = {
                    UploadJobEntry.COLUMN_NAME_UPLOAD_JOB,
                    UploadJobEntry.COLUMN_NAME_IS_COMPLETED
            };

            String selection = UploadJobEntry.COLUMN_NAME_IS_COMPLETED + " = ?";
            String[] selectionArgs = { "0" };

            String sortOrder =
                    UploadJobEntry.COLUMN_NAME_TIMESTAMP + " ASC";

            Cursor cursor = db.query(
                    UploadJobEntry.TABLE_NAME,
                    projection,
                    selection,
                    selectionArgs,
                    null,
                    null,
                    sortOrder
            );

            Set<ReceiptUploader.UploadJob> uploadJobs = new LinkedHashSet<>();

            try {

                while (cursor.moveToNext()) {
                    uploadJobs.add(cursorToUploadJob(cursor));
                }
                return uploadJobs;
            } finally {
                cursor.close();
            }
        } finally {
            lock.unlock();
        }
    }

    public Count getCount() {
        lock.lock();
        try {
            return new Count(
                    DatabaseUtils.queryNumEntries(db, UploadJobEntry.TABLE_NAME, UploadJobEntry.COLUMN_NAME_IS_COMPLETED + " = ?", new String[] { "1" }),
                    DatabaseUtils.queryNumEntries(db, UploadJobEntry.TABLE_NAME, UploadJobEntry.COLUMN_NAME_IS_COMPLETED + " = ?", new String[] { "0" })
            );
        } finally {
            lock.unlock();
        }
    }

    public void removeCompleted() {
        lock.lock();
        try {
            String selection = UploadJobEntry.COLUMN_NAME_IS_COMPLETED + " = ?";
            String[] selectionArgs = { "1" };

            db.delete(UploadJobEntry.TABLE_NAME, selection, selectionArgs);
        } finally {
            lock.unlock();
        }
    }

    public void markAsCompleted(UUID jobId) {
        lock.lock();
        try {
            ContentValues values = new ContentValues();
            values.put(UploadJobEntry.COLUMN_NAME_IS_COMPLETED, "1");

            String selection = UploadJobEntry.COLUMN_NAME_UPLOAD_JOB_ID + " = ?";
            String[] selectionArgs = { jobId.toString() };

            db.update(
                    UploadJobEntry.TABLE_NAME,
                    values,
                    selection,
                    selectionArgs);
        } finally {
            lock.unlock();
        }
    }

    private ReceiptUploader.UploadJob cursorToUploadJob(Cursor cursor) {
        String jobAsString = cursor.getString(cursor.getColumnIndexOrThrow(UploadJobEntry.COLUMN_NAME_UPLOAD_JOB));
        return toUploadJob(jobAsString);
    }

    private ContentValues toContentValues(ReceiptUploader.UploadJob uploadJob) {
        ContentValues values = new ContentValues();

        values.put(UploadJobEntry.COLUMN_NAME_UPLOAD_JOB_ID, uploadJob.id.toString());
        values.put(UploadJobEntry.COLUMN_NAME_UPLOAD_JOB, toJsonString(uploadJob));
        values.put(UploadJobEntry.COLUMN_NAME_TIMESTAMP, System.currentTimeMillis());

        return values;
    }

    private String toJsonString(ReceiptUploader.UploadJob job) {

        JSONObject json = new JSONObject();
        try {
            json.put("id", job.id);
            json.put("uploadUrl", job.uploadUrl);
            json.put("authToken", job.authToken);
            json.put("fileUri", job.fileUri.toString());
            json.put("fields", new JSONObject(job.fields));

            return json.toString(4);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    private ReceiptUploader.UploadJob toUploadJob(String asString) {
        try {

            JSONObject json = new JSONObject(asString);

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

    @Override
    public void close() {
        db.close();
    }
}
