package com.receiptsmobile.uploader;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;

public class Connectivity {

    public static class ConnectionStatus {
        public final boolean isConnected;
        public final boolean isConnectedWiFi;

        public ConnectionStatus(boolean isConnected, boolean isConnectedWiFi) {
            this.isConnected = isConnected;
            this.isConnectedWiFi = isConnectedWiFi;
        }
    }

    private static NetworkInfo getNetworkInfo(Context context){
        ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        return cm.getActiveNetworkInfo();
    }

    public static ConnectionStatus getStatus(Context context) {
        NetworkInfo info = Connectivity.getNetworkInfo(context);

        return new ConnectionStatus(true, true);

        /*
        return new ConnectionStatus(
                info != null && info.isConnected(),
                info != null && info.isConnected() && info.getType() == ConnectivityManager.TYPE_WIFI
        );
        */
    }
}
