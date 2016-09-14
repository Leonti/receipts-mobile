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
import com.receiptsmobile.MainActivity;
import com.receiptsmobile.R;
import com.receiptsmobile.files.FileCacher;

import java.io.File;
import java.util.*;
import java.util.concurrent.*;

public class UploadService extends Service {

    private final IBinder binder = new UploadServiceBinder();
    private static String TAG = "UploadService";
    private Set<ReceiptUploader.UploadJob> processing = Collections.newSetFromMap(new ConcurrentHashMap<ReceiptUploader.UploadJob, Boolean>());
    private ExecutorService executor;
    private UploadJobsStorage uploadJobsStorage;
    private int total = 0;
    private static int MAX_RETRIES = 3;
    public static String RECEIPT_UPLOADED = "ReceiptUploadedEvent";
    public static String UPLOAD_JOB_ID = "uploadJobId";
    public static String UPLOAD_JOB_STATUS = "uploadJobStatus";
    public static String RECEIPT_ID = "receiptId";
    public static String FILE_EXT = "ext";
    public static String FILE_ID = "fileId";

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG, "ON START COMMAND");
        List<ReceiptUploader.UploadJob> toUpload = uploadJobsStorage.getUploadJobs();

        total += calculateNewTotal(uploadJobsStorage);

        Log.i(TAG, "FILES TO UPLOAD");

        for (ReceiptUploader.UploadJob job : toUpload) {

            if (!processing.contains(job)) {
                submitFile(job, 0);
            }

            Log.i(TAG, job.toString());
        }

        startForeground(42, createProgressNotification(this, 0, uploadJobsStorage.getUploadJobs().size(), 0));
        updateProgress();

        return Service.START_STICKY;
    }

    private int calculateNewTotal(UploadJobsStorage storage) {
        List<ReceiptUploader.UploadJob> toUpload = storage.getUploadJobs();
        toUpload.removeAll(processing);
        return toUpload.size();
    }

    private void submitFile(final ReceiptUploader.UploadJob job, final int retry) {
        Log.i(TAG, "Submitting job for upload (" + job + "), retrying " + retry);

        Map<String, String> fields = new HashMap<>();
        fields.put("total", "");
        fields.put("description", "");
        executor.submit(new ReceiptUploader(
                this,
                job,
                new ReceiptUploader.Callback() {
                    @Override
                    public void onDone(final ReceiptUploader.Result result) {

                        if (result.status == ReceiptUploader.Result.Status.SUCCESS) {
                            removeUpload(job);

                            String fileUrl = appendSlash(job.uploadUrl) + result.receiptId + "/file/" + result.fileId + "." + toExt(result.file);
                            cacheFile(UploadService.this, fileUrl, job.fileUri, new FileCacher.Callback() {
                                @Override
                                public void onResult(Uri uri) {
                                    notifyReceiptResult(job.id, result);
                                    showProgressOrFinish();
                                }

                                @Override
                                public void onError(Throwable t) {
                                    notifyReceiptResult(job.id, result);
                                    showProgressOrFinish();
                                }
                            });

                        } else {
                            Log.i(TAG, "File upload is finished (" + job + "), but upload failed on retry " + retry);
                            if (retry < MAX_RETRIES) {

                                Log.i(TAG, "Max retries not yet reached (" + job + "), retrying");
                                scheduleDelayed(job, retry + 1);
                            } else {
                                Log.i(TAG, "Max retries reached (" + job + "), not retrying");
                                removeUpload(job);
                                notifyReceiptResult(job.id, result);
                                showProgressOrFinish();
                            }

                        }
                    }
                }));

        if (!processing.contains(job)) {
            processing.add(job);
        }
    }

    private void cacheFile(Context context, String url, Uri srcFileUri, FileCacher.Callback callback) {
        new FileCacher(context, url, srcFileUri, callback).run();
    }

    private static String appendSlash(String url) {
        return url.lastIndexOf("/") == url.length() - 1 ? url : url + "/";
    }

    private void notifyReceiptResult(UUID uploadJobId, ReceiptUploader.Result result) {
        Intent intent = new Intent(RECEIPT_UPLOADED);

        if (result.status == ReceiptUploader.Result.Status.SUCCESS) {
            intent.putExtra(UPLOAD_JOB_STATUS, result.status.toString());
            intent.putExtra(UPLOAD_JOB_ID, uploadJobId.toString());
            intent.putExtra(RECEIPT_ID, result.receiptId);
            intent.putExtra(FILE_EXT, toExt(result.file));
            intent.putExtra(FILE_ID, result.fileId);
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

        ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor();
        try {
            executor.schedule(new Runnable() {
                @Override
                public void run() {
                    submitFile(job, retry);
                }
            }, 30, TimeUnit.SECONDS);
        } finally {
            executor.shutdown();
        }

    }

    private void removeUpload(ReceiptUploader.UploadJob job) {
        processing.remove(job);
        uploadJobsStorage.removeUpload(job);
    }

    public Set<ReceiptUploader.UploadJob> getCurrentJobs() {
        return processing;
    }

    private void showProgressOrFinish() {

        if (processing.size() == 0) {
            notifyFinished(this);
            stopSelf();
            return;
        }

        updateProgress();
    }

    @Override
    public void onCreate() {
        Log.i(TAG, "ON CREATE COMMAND");

        executor = Executors.newFixedThreadPool(4);
        uploadJobsStorage = new UploadJobsStorage(this);
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

    private void updateProgress() {
        int done = total - processing.size();
        int progressPercent = (done * 100) / total;

        getNotificationManager().notify(42, createProgressNotification(this, progressPercent, total, done));
    }

    @Override
    public void onDestroy() {
        Log.i(TAG, "Destroying the service");
        executor.shutdown();
    }

    private NotificationManager getNotificationManager() {
        return (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    }

    private static Notification createProgressNotification(Context context, int progressPercent, int total, int done) {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context)
                .setAutoCancel(false)
                .setOngoing(true)
                .setContentTitle("Receipts upload")
                .setContentText("Receipts (" + done + "/" + total + ") are being uploaded")
                .setProgress(100, progressPercent, false)
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
