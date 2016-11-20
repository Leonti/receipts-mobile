package com.receiptsmobile.files;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.DatabaseUtils;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;
import com.receiptsmobile.db.DownloadJobEntryDbHelper;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.Closeable;
import java.util.*;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import com.receiptsmobile.db.DownloadJobEntryContract.*;

public class DownloadJobsStorage implements Closeable {

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

    public static class Jobs {
        final Set<DownloadJob> completed;
        final Set<DownloadJob> pending;

        public Jobs(Set<DownloadJob> completed, Set<DownloadJob> pending) {
            this.completed = completed;
            this.pending = pending;
        }
    }

    private static String TAG = "DownloadJobsStorage";

    private final SQLiteDatabase db;
    private final Lock lock = new ReentrantLock();

    public DownloadJobsStorage(Context context) {
        db = new DownloadJobEntryDbHelper(context).getWritableDatabase();
    }

    public void submitUploads(Set<DownloadJob> jobs) {
        lock.lock();
        try {
            long start = System.currentTimeMillis();
            db.beginTransaction();
            for (DownloadJob job : jobs) {
                Log.i(TAG, "Submitting: " + job.id);
                db.insert(DownloadJobEntry.TABLE_NAME, null, toContentValues(job));
            }
            db.setTransactionSuccessful();
            db.endTransaction();

            long end = System.currentTimeMillis();

            Log.i(TAG, "Time taken to submit jobs: " + ((end - start)/1000) + "s");
        } finally {
            lock.unlock();
        }
    }

    public Jobs getJobs() {
        lock.lock();
        try {

            String[] projection = {
                    DownloadJobEntry.COLUMN_NAME_JOB,
                    DownloadJobEntry.COLUMN_NAME_IS_COMPLETED
            };

       //     String selection = DownloadJobEntry.COLUMN_NAME_IS_COMPLETED + " = ?";
      //      String[] selectionArgs = { "0" };

            String sortOrder =
                    DownloadJobEntry.COLUMN_NAME_TIMESTAMP + " ASC";

            Cursor cursor = db.query(
                    DownloadJobEntry.TABLE_NAME,
                    projection,
                    null,
                    null,
                    null,
                    null,
                    sortOrder
            );

            Set<DownloadJob> completed = new HashSet<>();
            Set<DownloadJob> pending = new HashSet<>();

            try {

                while (cursor.moveToNext()) {

                    DownloadJob job = cursorToJob(cursor);
                    int isCompleted = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadJobEntry.COLUMN_NAME_IS_COMPLETED));

                    if (isCompleted == 1) {
                        completed.add(job);
                    } else {
                        pending.add(job);
                    }
                }
                return new Jobs(completed, pending);
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
                    DatabaseUtils.queryNumEntries(db, DownloadJobEntry.TABLE_NAME, DownloadJobEntry.COLUMN_NAME_IS_COMPLETED + " = ?", new String[] { "1" }),
                    DatabaseUtils.queryNumEntries(db, DownloadJobEntry.TABLE_NAME, DownloadJobEntry.COLUMN_NAME_IS_COMPLETED + " = ?", new String[] { "0" })
            );
        } finally {
            lock.unlock();
        }
    }

    public void removeCompleted() {
        lock.lock();
        try {
            String selection = DownloadJobEntry.COLUMN_NAME_IS_COMPLETED + " = ?";
            String[] selectionArgs = { "1" };

            db.delete(DownloadJobEntry.TABLE_NAME, selection, selectionArgs);
        } finally {
            lock.unlock();
        }
    }

    public void markAsCompleted(UUID jobId) {
        lock.lock();
        try {
            ContentValues values = new ContentValues();
            values.put(DownloadJobEntry.COLUMN_NAME_IS_COMPLETED, "1");

            String selection = DownloadJobEntry.COLUMN_NAME_JOB_ID + " = ?";
            String[] selectionArgs = { jobId.toString() };

            db.update(
                    DownloadJobEntry.TABLE_NAME,
                    values,
                    selection,
                    selectionArgs);
        } finally {
            lock.unlock();
        }
    }

    private DownloadJob cursorToJob(Cursor cursor) {
        String jobAsString = cursor.getString(cursor.getColumnIndexOrThrow(DownloadJobEntry.COLUMN_NAME_JOB));
        return toJob(jobAsString);
    }

    private ContentValues toContentValues(DownloadJob downloadJob) {
        ContentValues values = new ContentValues();

        values.put(DownloadJobEntry.COLUMN_NAME_JOB_ID, downloadJob.id.toString());
        values.put(DownloadJobEntry.COLUMN_NAME_JOB, toJsonString(downloadJob));
        values.put(DownloadJobEntry.COLUMN_NAME_TIMESTAMP, System.currentTimeMillis());

        return values;
    }

    private String toJsonString(DownloadJob job) {

        JSONObject json = new JSONObject();
        try {
            json.put("id", job.id);
            json.put("src", job.src);
            json.put("dst", job.dst);
            json.put("headers", new JSONObject(job.headers));

            return json.toString(4);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    private DownloadJob toJob(String asString) {
        try {

            JSONObject json = new JSONObject(asString);

            return new DownloadJob(
                    UUID.fromString(json.getString("id")),
                    json.getString("src"),
                    toMap(json.getJSONObject("headers")),
                    json.getString("dst")
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

