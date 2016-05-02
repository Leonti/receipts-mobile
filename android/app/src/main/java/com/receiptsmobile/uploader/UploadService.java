package com.receiptsmobile.uploader;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Binder;
import android.os.IBinder;
import android.support.v4.app.NotificationCompat;
import android.util.Log;
import com.receiptsmobile.MainActivity;
import com.receiptsmobile.R;

import java.io.File;
import java.util.*;
import java.util.concurrent.*;

public class UploadService extends Service {

    private final IBinder binder = new UploadServiceBinder();

    private static String TAG = "UploadService";

    private Set<String> processing = Collections.newSetFromMap(new ConcurrentHashMap<String, Boolean>());

    private ExecutorService executor;

    private int total = 0;

    private static int MAX_RETRIES = 3;

    public static String RECEIPT_UPLOADED = "ReceiptUploadedEvent";

    public static String RECEIPT_ID = "receiptId";

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG, "ON START COMMAND");
        UploadJobsStorage storage = new UploadJobsStorage(this);
        Set<String> toUpload = storage.getUploads();

        total = calculateTotal(storage);

        Log.i(TAG, "FILES TO UPLOAD");

        for (final String file : toUpload) {

            if (!processing.contains(file)) {
                submitFile(file, 0);
            }

            Log.i(TAG, file);
        }

        Log.i(TAG, "Auth token " + storage.getAuthToken());
        Log.i(TAG, "Upload url " + storage.getUploadUrl());

        showProgress();

        return Service.START_STICKY;
    }

    private int calculateTotal(UploadJobsStorage storage) {
        Set<String> toUpload = storage.getUploads();
        toUpload.removeAll(processing);
        return toUpload.size();
    }

    private void submitFile(final String file, final int retry) {
        Log.i(TAG, "Submitting file for upload (" + file + "), retrying");

        UploadJobsStorage storage = new UploadJobsStorage(this);
        executor.submit(new ReceiptUploader(new File(file), storage.getAuthToken(), storage.getUploadUrl(),
                new ReceiptUploader.Callback() {
                    @Override
                    public void onDone(ReceiptUploader.Result result) {
                        processing.remove(file);

                        if (result.status == ReceiptUploader.Result.Status.SUCCESS) {
                            notifyReceiptResult(result);
                            removeUpload(file);
                            showProgressOrFinish();
                        } else {
                            Log.i(TAG, "File upload is finished (" + file + "), but upload failed on retry " + retry);
                            if (retry < MAX_RETRIES) {

                                Log.i(TAG, "Max retries not yet reached (" + file + "), retrying");
                                scheduleDelayed(file, retry + 1);
                            } else {
                                Log.i(TAG, "Max retries reached (" + file + "), not retrying");
                                notifyReceiptResult(result);
                                showProgressOrFinish();
                            }

                        }
                    }
                }));
        processing.add(file);
    }

    private void notifyReceiptResult(ReceiptUploader.Result result) {
        Intent intent = new Intent(RECEIPT_UPLOADED);

        if (result.status == ReceiptUploader.Result.Status.SUCCESS) {
            intent.putExtra(RECEIPT_ID, result.receiptId);
        }
        sendBroadcast(intent);
    }

    private void scheduleDelayed(final String file, final int retry) {

        ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor();
        try {
            executor.schedule(new Runnable() {
                @Override
                public void run() {
                    submitFile(file, retry);
                }
            }, 30, TimeUnit.SECONDS);
        } finally {
            executor.shutdown();
        }

    }

    private void removeUpload(String file) {
        new UploadJobsStorage(this).removeUpload(file);
    }

    private void showProgressOrFinish() {

        if (processing.size() == 0) {
            notifyFinished(this);
            stopSelf();
            return;
        }

        showProgress();
    }

    private void showProgress() {
        int done = total - processing.size();
        int progress = (done * 100) / total;

        updateProgress(progress);
    }

    @Override
    public void onCreate() {
        Log.i(TAG, "ON CREATE COMMAND");

        executor = Executors.newSingleThreadExecutor();
        startForeground(42, createProgressNotification(this, 0));
    }

    private void notifyFinished(Context context) {

        stopForeground(true);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context)
                .setAutoCancel(true)
                .setOngoing(false)
                .setContentTitle("Receipts uploaded")
                .setContentText("Receipts are uploaded")
                .setSmallIcon(R.drawable.ic_done_all_white_24dp)
                .setContentIntent(PendingIntent.getActivity(context, 1, new Intent(context, MainActivity.class), 0));

        getNotificationManager().notify(42, builder.build());
    }

    private void updateProgress(int progress) {
        getNotificationManager().notify(42, createProgressNotification(this, progress));
    }

    @Override
    public void onDestroy() {
        Log.i(TAG, "Destroying the service");
        executor.shutdown();
    }

    private NotificationManager getNotificationManager() {
        return (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    }

    private static Notification createProgressNotification(Context context, int progress) {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context)
                .setAutoCancel(false)
                .setOngoing(true)
                .setContentTitle("Receipts upload")
                .setContentText("Receipts are being uploaded")
                .setProgress(100, progress, false)
                .setSmallIcon(R.drawable.ic_file_upload_white_24dp)
                .setContentIntent(PendingIntent.getActivity(context, 1, new Intent(context, MainActivity.class), 0));

        return builder.build();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return binder;
    }

    public class UploadServiceBinder extends Binder {
        UploadService getService() {
            return UploadService.this;
        }
    }
}
