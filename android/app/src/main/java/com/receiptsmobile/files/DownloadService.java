package com.receiptsmobile.files;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Binder;
import android.os.IBinder;
import android.support.v4.app.NotificationCompat;
import android.util.Log;
import com.facebook.common.internal.Sets;
import com.receiptsmobile.MainActivity;
import com.receiptsmobile.R;
import com.receiptsmobile.uploader.Connectivity;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import com.receiptsmobile.files.DownloadJobsStorage.Count;
import com.receiptsmobile.files.DownloadJobsStorage.Jobs;

public class DownloadService extends Service {

    private final IBinder binder = new DownloadService.DownloadServiceBinder();
    private static String TAG = "DownloadService";
    private Set<DownloadJob> processing = Collections.newSetFromMap(new ConcurrentHashMap<DownloadJob, Boolean>());
    private ExecutorService executor;
    private ExecutorService submitJobsExecutor;
    private ScheduledExecutorService delayedJobsExecutor = Executors.newSingleThreadScheduledExecutor();
    private DownloadJobsStorage downloadJobsStorage;
    private boolean isCreated = false;

    private Lock lock = new ReentrantLock();

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

        isCreated = false;
        executor = Executors.newFixedThreadPool(4);
        submitJobsExecutor = Executors.newSingleThreadExecutor();
        downloadJobsStorage = new DownloadJobsStorage(this);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG, "ON START COMMAND");

        lock.lock();

        try {
            return initialize();
        } finally {
            lock.unlock();
        }
    }

    private int initialize() {
        if (isCreated) {
            Log.i(TAG, "SERVICE IS ALREADY STARTED NOT RESTARTING");
            return Service.START_STICKY;
        }

        isCreated = true;

        Set<DownloadJob> toDownload = downloadJobsStorage.getJobs().pending;
        Log.i(TAG, "GOT DOWNLOAD JOBS " + toDownload.size());

        Count count = downloadJobsStorage.getCount();

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

        Log.i(TAG, "FILES TO DOWNLOAD pending: " + count.pending + ", completedCount: " + count.completed);

        for (DownloadJob job : toDownload) {

            if (!processing.contains(job)) {
                submitJob(job, 0);
            }

            Log.i(TAG, job.toString());
        }

        if (count.total > 0) {
            long progressPercent = (count.completed * 100) / count.total;
            startForeground(NOTIFICATION_ID, createProgressNotification(this, progressPercent, count.pending, 0));
            updateProgress(count);
        }

        return Service.START_STICKY;
    }

    public void download(DownloadJob toDownload) {
        download(Sets.newHashSet(toDownload));
    }

    public void download(final Set<DownloadJob> toDownload) {

        submitJobsExecutor.submit(new Runnable() {
            @Override
            public void run() {

                lock.lock();
                try {
                    Set<DownloadJob> newJobs = new HashSet<>();
                    Jobs jobs = downloadJobsStorage.getJobs();

                    for (DownloadJob job : toDownload) {

                        if (new File(job.dst + ".part").exists()) {
                            Log.i(TAG, "File is already being downloaded " + job.dst);
                        } else if (new File(job.dst).exists()) {
                            Log.i(TAG, "Dst already exists " + job.dst);
                        } else if (jobs.completed.contains(job)) {
                            Log.i(TAG, "Job is in completed!");
                        } else if (jobs.pending.contains(job)) {
                            Log.i(TAG, "Job is in pending!");
                        } else {
                            newJobs.add(job);
                        }
                    }

                    downloadJobsStorage.submitUploads(newJobs);

                    for (DownloadJob job : newJobs) {

                        Log.i(TAG, "Submitting a new download job" + job.toString());
                        submitJob(job, 0);
                    }

                    showProgressOrFinish();
                } catch (Exception e) {
                    Log.e(TAG, "Exception submitting a job " + e, e);
                } finally {
                    lock.unlock();
                }
            }
        });
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
                            Log.i(TAG, "Job completed " + job.dst);
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

        Count count = downloadJobsStorage.getCount();

        Log.i(TAG, "Show progress or finish, pending: " + count.pending + ", completed " + count.completed);

        if (count.pending == 0) {
            downloadJobsStorage.removeCompleted();
            notifyFinished(this);
            stopSelf();
            return;
        }

        updateProgress(count);
    }

    private void notifyFinished(Context context) {
        getNotificationManager().cancel(NOTIFICATION_ID);
        stopForeground(true);
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
        downloadJobsStorage.close();
    }

    private NotificationManager getNotificationManager() {
        return (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    }

    private Notification createProgressNotification(Context context, long progressPercent, long total, long done) {
        String NOTIFICATION_CHANNEL_ID = "download_progress_notification";

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(NOTIFICATION_CHANNEL_ID, NOTIFICATION_CHANNEL_ID, NotificationManager.IMPORTANCE_LOW);
            channel.setDescription("Receipt download progress");
            getNotificationManager().createNotificationChannel(channel);
        }

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, NOTIFICATION_CHANNEL_ID)
                .setAutoCancel(false)
                .setOngoing(true)
                .setContentTitle("Receipts download")
                .setContentText("Receipts (" + done + "/" + total + ") are being downloaded")
                .setProgress(100, (int) progressPercent, false)
                .setSmallIcon(R.drawable.ic_file_download_white_24dp)
                .setContentIntent(PendingIntent.getActivity(context, 1, new Intent(context, MainActivity.class), 0));

        return builder.build();
    }

    private Notification createPausedNotification(Context context, boolean isWiFi) {
        String NOTIFICATION_CHANNEL_ID = "download_paused_notification";

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(NOTIFICATION_CHANNEL_ID, NOTIFICATION_CHANNEL_ID, NotificationManager.IMPORTANCE_LOW);
            channel.setDescription("Receipt download paused");
            getNotificationManager().createNotificationChannel(channel);
        }

        String message = isWiFi ? "waiting for WiFi connection" : "waiting for internet connection";

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, NOTIFICATION_CHANNEL_ID)
                .setAutoCancel(false)
                .setOngoing(true)
                .setContentTitle("Receipts download")
                .setContentText("Receipts download is paused - " + message)
                .setSmallIcon(R.drawable.ic_file_download_white_24dp)
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
