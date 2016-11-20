package com.receiptsmobile;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import com.receiptsmobile.files.DownloadService;
import com.receiptsmobile.uploader.Connectivity;
import com.receiptsmobile.uploader.UploadService;

public class NetWatcher extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        //here, check that the network connection is available. If yes, start your service. If not, stop your service.
        Connectivity.ConnectionStatus connectionStatus = Connectivity.getStatus(context);

        Intent downloadServiceIntent = new Intent(context, DownloadService.class);
        Intent uploadServiceIntent = new Intent(context, UploadService.class);

        if (connectionStatus.isConnected && connectionStatus.isConnectedWiFi) {

            context.startService(downloadServiceIntent);
            context.startService(uploadServiceIntent);
        } else {

            context.stopService(downloadServiceIntent);
            context.stopService(uploadServiceIntent);
        }
    }
}
