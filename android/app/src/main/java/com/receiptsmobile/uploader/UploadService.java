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

import java.util.HashSet;
import java.util.Set;

public class UploadService extends Service {

    private final IBinder binder = new UploadServiceBinder();

    private static String TAG = "UploadService";

    private Set<String> files = new HashSet<>();

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG, "ON START COMMAND");
        UploadJobsStorage storage = new UploadJobsStorage(this);
        files.addAll(storage.getUploads());

        Log.i(TAG, "FILES TO UPLOAD");

        for (String file : files) {
            Log.i(TAG, file);
        }

        Log.i(TAG, "Auth token " + storage.getAuthToken());
        Log.i(TAG, "Upload url " + storage.getUploadUrl());

        updateProgress(30);
        notifyFinished(this);

        return Service.START_STICKY;
    }

    @Override
    public void onCreate() {
        Log.i(TAG, "ON CREATE COMMAND");


        startForeground(42, createProgressNotification(this, 0));
    }

    private void notifyFinished(Context context) {

        stopForeground(true);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context)
                .setAutoCancel(true)
                .setOngoing(false)
                .setContentTitle("Receipts uploaded")
                .setContentText("Receipts are uploaded")
          //      .setProgress(100, 100, false)
                .setSmallIcon(R.drawable.ic_done_all_white_24dp)
                .setContentIntent(PendingIntent.getActivity(context, 1, new Intent(context, MainActivity.class), 0));

        getNotificationManager().notify(42, builder.build());
    }

    private void updateProgress(int progress) {
        getNotificationManager().notify(42, createProgressNotification(this, progress));
    }

    @Override
    public void onDestroy() {
        getNotificationManager().cancel(42);
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
