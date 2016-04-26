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

public class UploadService extends Service {

    private final IBinder binder = new UploadServiceBinder();

    private static String TAG = "UploadService";

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG, "ON START COMMAND");


        return Service.START_STICKY;
    }

    @Override
    public void onCreate() {
        Log.i(TAG, "ON CREATE COMMAND");


        startForeground(42, createNotification(this));
    }

    @Override
    public void onDestroy() {
        NotificationManager notificationManager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.cancel(42);
    }

    private static Notification createNotification(Context context) {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context)
                .setAutoCancel(false)
                .setOngoing(true)
                .setContentTitle("Receipt is being upaloded")
                .setContentText("some text")
                .setSmallIcon(R.drawable.ic_launcher)
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
