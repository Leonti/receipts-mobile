package com.receiptsmobile.files;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Binder;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.support.v4.app.NotificationCompat;
import android.util.Log;
import com.facebook.common.internal.Sets;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.receiptsmobile.MainActivity;
import com.receiptsmobile.R;
import com.receiptsmobile.uploader.Connectivity;
import com.receiptsmobile.uploader.ReceiptUploader;
import com.receiptsmobile.uploader.UploadJobsStorage;
import com.receiptsmobile.uploader.UploadService;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.*;
import java.util.concurrent.*;

public class DownloadService extends Service {

    private final IBinder binder = new DownloadService.DownloadServiceBinder();
    private static String TAG = "DownloadService";
    private Set<DownloadJob> processing = Collections.newSetFromMap(new ConcurrentHashMap<DownloadJob, Boolean>());
    private ExecutorService executor;
    private ScheduledExecutorService delayedJobsExecutor = Executors.newSingleThreadScheduledExecutor();
    private DownloadJobsStorage downloadJobsStorage;
    private static int MAX_RETRIES = 3;

    private static int NOTIFICATION_ID = 43;

    public static final String FILE_DOWNLOADED = "FILE_DOWNLOADED";
    public static final String DOWNLOAD_JOB_ID = "DOWNLOAD_JOB_ID";
    public static final String FILE_DST = "FILE_DST";
    public static final String FILE_DOWNLOADED_STATUS = "FILE_DOWNLOADED_STATUS";
    public static final String FILE_SIZE = "FILE_SIZE";
    public enum DownloadStatus { SUCCESS, FAILURE }

    @Override
    public void onCreate() {
        Log.i(TAG, "ON CREATE COMMAND");

        executor = Executors.newFixedThreadPool(4);
        downloadJobsStorage = new DownloadJobsStorage(this);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG, "ON START COMMAND");

        Set<DownloadJob> toDownload = downloadJobsStorage.getUploadJobs();
        Log.i(TAG, "GOT DOWNLOAD JOBS " + toDownload.size());

        long pendingCount = downloadJobsStorage.getPendingCount();
        long completedCount = downloadJobsStorage.getCompletedCount();
        long total = pendingCount + completedCount;

        Connectivity.ConnectionStatus connectionStatus = Connectivity.getStatus(this);

        if (!connectionStatus.isConnected && pendingCount > 0) {
            Log.i(TAG, "There is no connectivity, not processing jobs");
            startForeground(NOTIFICATION_ID, createPausedNotification(this, false));
            return Service.START_STICKY;
        }

        if (!connectionStatus.isConnectedWiFi && pendingCount > 0) {
            Log.i(TAG, "There is no WiFi connection, not processing jobs ");
            startForeground(NOTIFICATION_ID, createPausedNotification(this, true));
            return Service.START_STICKY;
        }

        Log.i(TAG, "FILES TO UPLOAD pending: " + pendingCount + ", completedCount: " + completedCount);

        for (DownloadJob job : toDownload) {

            if (!processing.contains(job)) {
                submitJob(job, 0);
            }

            Log.i(TAG, job.toString());
        }

        if (total > 0) {
            startForeground(NOTIFICATION_ID, createProgressNotification(this, 0, downloadJobsStorage.getUploadJobs().size(), 0));
            updateProgress(pendingCount, completedCount);
        }

        return Service.START_STICKY;
    }

    public void download(DownloadJob toDownload) {
        download(Sets.newHashSet(toDownload));
    }

    public void download(Set<DownloadJob> toDownload) {

        Set<DownloadJob> newJobs = new HashSet<>();
        Set<DownloadJob> existingJobs = downloadJobsStorage.getUploadJobs();
        for (DownloadJob job : toDownload) {
            if (!existingJobs.contains(job)) {
                newJobs.add(job);
            }
        }
        downloadJobsStorage.submitUploads(newJobs);

        for (DownloadJob job : newJobs) {
            submitJob(job, 0);

            Log.i(TAG, "Submitting a new download job" + job.toString());
        }

        showProgressOrFinish();
    }

    private void submitJob(final DownloadJob job, final int retry) {
        Log.i(TAG, "Submitting job for download (" + job + "), retrying " + retry);

        final FileDownloader downloader = new FileDownloader(new DownloadParams(
                toUrl(job.src),
                job.headers,
                new File(job.dst),
                new DownloadParams.OnDownloadCompleted() {
                    @Override
                    public void onDownloadCompleted(DownloadResult result) {
                        if (result.exception == null) {
                            markAsCompleted(job.id);
                            notifyJobResult(job.id, result, job.dst);
                            showProgressOrFinish();
                        } else {
                            Log.i(TAG, "File download is finished (" + job + "), but download failed on retry " + retry);
                            if (retry < MAX_RETRIES) {

                                Log.i(TAG, "Max retries not yet reached (" + job + "), retrying");
                                scheduleDelayed(job, retry + 1);
                            } else {
                                Log.i(TAG, "Max retries reached (" + job + "), not retrying");
                                markAsCompleted(job.id);
                                notifyJobResult(job.id, result, job.dst);
                                showProgressOrFinish();
                            }
                        }
                    }
                }
        ));

        executor.submit(new Runnable() {
            @Override
            public void run() {
                try {

                    Connectivity.ConnectionStatus connectionStatus = Connectivity.getStatus(DownloadService.this);

                    if (!connectionStatus.isConnected) {
                        Log.i(TAG, "There is no connectivity, not processing jobs");
                        processing.remove(job);
                        getNotificationManager().notify(NOTIFICATION_ID, createPausedNotification(DownloadService.this, false));
                        return;
                    }

                    if (!connectionStatus.isConnectedWiFi) {
                        Log.i(TAG, "There is no WiFi connection, not processing jobs");
                        processing.remove(job);
                        getNotificationManager().notify(NOTIFICATION_ID, createPausedNotification(DownloadService.this, true));
                        return;
                    }

                    downloader.run();
                } catch (Exception e) {
                    Log.e(TAG, "Error while downloading a receipt " + e, e);
                }

            }
        });

        if (!processing.contains(job)) {
            processing.add(job);
        } else {
            Log.i(TAG, "Skipping job - already on the list");
        }
    }

    private void notifyJobResult(UUID jobId, DownloadResult result, String dst) {
        Intent intent = new Intent(FILE_DOWNLOADED);

        if (result.exception == null) {
            intent.putExtra(FILE_DOWNLOADED_STATUS, DownloadStatus.SUCCESS.name());
            intent.putExtra(DOWNLOAD_JOB_ID, jobId.toString());
          //  intent.putExtra(FILE_SIZE, result.bytesWritten);
            intent.putExtra(FILE_DST, dst);
        } else {
            intent.putExtra(FILE_DOWNLOADED_STATUS, DownloadStatus.FAILURE.name());
            intent.putExtra(FILE_DST, dst);
        }
        sendBroadcast(intent);
    }

    private URL toUrl(String url) {
        try {
            return new URL(url);
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }
    }

    private void scheduleDelayed(final DownloadJob job, final int retry) {

        delayedJobsExecutor.schedule(new Runnable() {
            @Override
            public void run() {
                submitJob(job, retry);
            }
        }, 30, TimeUnit.SECONDS);

    }

    private void markAsCompleted(UUID jobId) {
        downloadJobsStorage.markAsCompleted(jobId);
    }

    private void showProgressOrFinish() {

        long pendingCount = downloadJobsStorage.getPendingCount();
        long completedCount = downloadJobsStorage.getCompletedCount();

        if (pendingCount == 0) {
            downloadJobsStorage.removeCompleted();
            notifyFinished(this);
            stopSelf();
            return;
        }

        updateProgress(pendingCount, completedCount);
    }

    private void notifyFinished(Context context) {
        stopForeground(true);
    }

    private void updateProgress(long pendingCount, long completedCount) {
        long total = pendingCount + completedCount;

        if (total > 0) {
            long progressPercent = (completedCount * 100) / total;
            getNotificationManager().notify(NOTIFICATION_ID, createProgressNotification(this, progressPercent, total, completedCount));
        }
    }

    @Override
    public void onDestroy() {
        Log.i(TAG, "Destroying the service");
        executor.shutdown();
        delayedJobsExecutor.shutdown();
        downloadJobsStorage.close();
    }

    private NotificationManager getNotificationManager() {
        return (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    }

    private static Notification createProgressNotification(Context context, long progressPercent, long total, long done) {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context)
                .setAutoCancel(false)
                .setOngoing(true)
                .setContentTitle("Receipts download")
                .setContentText("Receipts (" + done + "/" + total + ") are being downloaded")
                .setProgress(100, (int) progressPercent, false)
               // .setSmallIcon(R.drawable.ic_file_upload_white_24dp)
                .setContentIntent(PendingIntent.getActivity(context, 1, new Intent(context, MainActivity.class), 0));

        return builder.build();
    }

    private static Notification createPausedNotification(Context context, boolean isWiFi) {

        String message = isWiFi ? "waiting for WiFi connection" : "waiting for internet connection";

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context)
                .setAutoCancel(false)
                .setOngoing(true)
                .setContentTitle("Receipts download")
                .setContentText("Receipts download is paused - " + message)
                .setSmallIcon(R.drawable.ic_file_upload_white_24dp)
                .setContentIntent(PendingIntent.getActivity(context, 1, new Intent(context, MainActivity.class), 0));

        return builder.build();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return binder;
    }

    public class DownloadServiceBinder extends Binder {
        DownloadService getService() {
            return DownloadService.this;
        }
    }
}
