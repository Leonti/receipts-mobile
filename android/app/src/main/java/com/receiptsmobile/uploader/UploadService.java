package com.receiptsmobile.uploader;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Binder;
import android.os.IBinder;
import android.support.v4.app.NotificationCompat;
import android.util.Log;
import com.facebook.common.internal.Sets;
import com.receiptsmobile.MainActivity;
import com.receiptsmobile.R;

import java.io.File;
import java.util.*;
import java.util.concurrent.*;

import com.receiptsmobile.files.DownloadJob;
import com.receiptsmobile.uploader.UploadJobsStorage.Count;
import com.receiptsmobile.uploader.ReceiptUploader.UploadJob;

public class UploadService extends Service {

    public static final int NOTIFICATION_ID = 42;
    private final IBinder binder = new UploadServiceBinder();
    private static String TAG = "UploadService";
    private Set<ReceiptUploader.UploadJob> processing = Collections.newSetFromMap(new ConcurrentHashMap<ReceiptUploader.UploadJob, Boolean>());
    private ExecutorService executor;
    private ExecutorService submitJobsExecutor;
    private ScheduledExecutorService delayedJobsExecutor = Executors.newSingleThreadScheduledExecutor();
    private UploadJobsStorage uploadJobsStorage;
    private boolean isCreated = false;
    private static int MAX_RETRIES = 3;
    public static String RECEIPT_UPLOADED = "ReceiptUploadedEvent";
    public static String UPLOAD_JOB_ID = "uploadJobId";
    public static String UPLOAD_JOB_STATUS = "uploadJobStatus";
    public static String RECEIPT_ID = "receiptId";
    public static String FILE_EXT = "ext";

    @Override
    public void onCreate() {
        Log.i(TAG, "ON CREATE COMMAND");

        isCreated = false;
        executor = Executors.newFixedThreadPool(4);
        submitJobsExecutor = Executors.newSingleThreadExecutor();
        uploadJobsStorage = new UploadJobsStorage(this);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG, "ON START COMMAND");

        if (isCreated) {
            Log.i(TAG, "SERVICE IS ALREADY STARTED NOT RESTARTING");
            return Service.START_STICKY;
        }

        isCreated = true;

        Set<ReceiptUploader.UploadJob> toUpload = uploadJobsStorage.getUploadJobs();
        Log.i(TAG, "GOT UPLOAD JOBS " + toUpload.size());

        UploadJobsStorage.Count count = uploadJobsStorage.getCount();
        Connectivity.ConnectionStatus connectionStatus = Connectivity.getStatus(this);

        if (!connectionStatus.isConnected && count.pending > 0) {
            Log.i(TAG, "There is no connectivity, not processing jobs");
            startForeground(NOTIFICATION_ID, createPausedNotification(this, false));
            return Service.START_STICKY;
        }

        if (!connectionStatus.isConnectedWiFi && count.pending > 0) {
            Log.i(TAG, "There is no WiFi connection, not processing jobs ");
            startForeground(NOTIFICATION_ID, createPausedNotification(this, true));
            return Service.START_STICKY;
        }

        Log.i(TAG, "FILES TO UPLOAD pending: " + count.pending + ", completedCount: " + count.completed);

        for (ReceiptUploader.UploadJob job : toUpload) {

            if (!processing.contains(job)) {
                submitFile(job, 0);
            }

            Log.i(TAG, job.toString());
        }

        if (count.total > 0) {
            long progressPercent = (count.completed * 100) / count.total;
            startForeground(NOTIFICATION_ID, createProgressNotification(this, progressPercent, uploadJobsStorage.getUploadJobs().size(), 0));
            updateProgress(count);
        }

        return Service.START_STICKY;
    }

    public void upload(final Set<UploadJob> toUpload) {

        submitJobsExecutor.submit(new Runnable() {
            @Override
            public void run() {
                try {
                    Set<UploadJob> newJobs = new HashSet<>();
                    Set<UploadJob> existingJobs = uploadJobsStorage.getUploadJobs();
                    for (UploadJob job : toUpload) {
                        if (!existingJobs.contains(job)) {
                            newJobs.add(job);
                        }
                    }
                    uploadJobsStorage.submitUploads(newJobs);

                    for (UploadJob job : newJobs) {

                        Log.i(TAG, "Submitting a new upload job" + job.toString());
                        submitFile(job, 0);
                    }

                    showProgressOrFinish();
                } catch (Exception e) {
                    Log.e(TAG, "Exception submitting a job " + e, e);
                }
            }
        });
    }

    private void submitFile(final ReceiptUploader.UploadJob job, final int retry) {
        Log.i(TAG, "Submitting job for upload (" + job + "), retrying " + retry);

        final Runnable uploadTask = new ReceiptUploader(
                this,
                job,
                new ReceiptUploader.Callback() {
                    @Override
                    public void onDone(final ReceiptUploader.Result result) {

                        if (result.status == ReceiptUploader.Result.Status.SUCCESS) {
                            markAsCompleted(job.id);
                            notifyReceiptResult(job.id, result);
                            showProgressOrFinish();
                        } else {
                            Log.i(TAG, "File upload is finished (" + job + "), but upload failed on retry " + retry);
                            if (retry < MAX_RETRIES) {

                                Log.i(TAG, "Max retries not yet reached (" + job + "), retrying");
                                scheduleDelayed(job, retry + 1);
                            } else {
                                Log.i(TAG, "Max retries reached (" + job + "), not retrying");
                                markAsCompleted(job.id);
                                notifyReceiptResult(job.id, result);
                                showProgressOrFinish();
                            }

                        }
                    }
                });

        executor.submit(new Runnable() {
            @Override
            public void run() {
                try {

                    Connectivity.ConnectionStatus connectionStatus = Connectivity.getStatus(UploadService.this);

                    if (!connectionStatus.isConnected) {
                        Log.i(TAG, "There is no connectivity, not processing jobs");
                        processing.remove(job);
                        getNotificationManager().notify(NOTIFICATION_ID, createPausedNotification(UploadService.this, false));
                        return;
                    }

                    if (!connectionStatus.isConnectedWiFi) {
                        Log.i(TAG, "There is no WiFi connection, not processing jobs");
                        processing.remove(job);
                        getNotificationManager().notify(NOTIFICATION_ID, createPausedNotification(UploadService.this, true));
                        return;
                    }

                    uploadTask.run();
                } catch (Exception e) {
                    Log.e(TAG, "Error while uploading a receipt " + e, e);
                }

            }
        });

        if (!processing.contains(job)) {
            processing.add(job);
        } else {
            Log.i(TAG, "Skipping job - already on the list");
        }
    }

    private void notifyReceiptResult(UUID uploadJobId, ReceiptUploader.Result result) {
        Intent intent = new Intent(RECEIPT_UPLOADED);

        if (result.status == ReceiptUploader.Result.Status.SUCCESS) {
            intent.putExtra(UPLOAD_JOB_STATUS, result.status.toString());
            intent.putExtra(UPLOAD_JOB_ID, uploadJobId.toString());
            intent.putExtra(RECEIPT_ID, result.receiptId);
            intent.putExtra(FILE_EXT, toExt(result.file));
        } else {
            intent.putExtra(UPLOAD_JOB_STATUS, result.status.toString());
            intent.putExtra(UPLOAD_JOB_ID, uploadJobId.toString());
        }
        sendBroadcast(intent);
    }

    private String toExt(File file) {
        String[] splitted = file.getName().split("\\.");
        return splitted.length > 0 ? splitted[splitted.length -1] : "";
    }

    private void scheduleDelayed(final ReceiptUploader.UploadJob job, final int retry) {

        delayedJobsExecutor.schedule(new Runnable() {
            @Override
            public void run() {
                submitFile(job, retry);
            }
        }, 30, TimeUnit.SECONDS);

    }

    private void markAsCompleted(UUID jobId) {
        uploadJobsStorage.markAsCompleted(jobId);
    }

    public Set<ReceiptUploader.UploadJob> getCurrentJobs() {
        return processing;
    }

    private void showProgressOrFinish() {
        Count count = uploadJobsStorage.getCount();

        if (count.pending == 0) {
            uploadJobsStorage.removeCompleted();
            notifyFinished(this);
            stopSelf();
            return;
        }

        updateProgress(count);
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

        getNotificationManager().notify(NOTIFICATION_ID, builder.build());
    }

    private void updateProgress(Count count) {

        if (count.total > 0) {
            long progressPercent = (count.completed * 100) / count.total;
            getNotificationManager().notify(NOTIFICATION_ID, createProgressNotification(this, progressPercent, count.total, count.completed));
        }
    }

    @Override
    public void onDestroy() {
        Log.i(TAG, "Destroying the service");
        executor.shutdown();
        submitJobsExecutor.shutdown();
        delayedJobsExecutor.shutdown();
        uploadJobsStorage.close();
    }

    private NotificationManager getNotificationManager() {
        return (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    }

    private static Notification createProgressNotification(Context context, long progressPercent, long total, long done) {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context)
                .setAutoCancel(false)
                .setOngoing(true)
                .setContentTitle("Receipts upload")
                .setContentText("Receipts (" + done + "/" + total + ") are being uploaded")
                .setProgress(100, (int) progressPercent, false)
                .setSmallIcon(R.drawable.ic_file_upload_white_24dp)
                .setContentIntent(PendingIntent.getActivity(context, 1, new Intent(context, MainActivity.class), 0));

        return builder.build();
    }

    private static Notification createPausedNotification(Context context, boolean isWiFi) {

        String message = isWiFi ? "waiting for WiFi connection" : "waiting for internet connection";

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context)
                .setAutoCancel(false)
                .setOngoing(true)
                .setContentTitle("Receipts upload")
                .setContentText("Receipts upload is paused - " + message)
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
