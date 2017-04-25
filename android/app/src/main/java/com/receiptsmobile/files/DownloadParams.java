package com.receiptsmobile.files;

import java.io.File;
import java.net.URL;
import java.util.Map;

public class DownloadParams {

    public interface OnDownloadCompleted {
        void onDownloadCompleted(DownloadResult res);
    }

    public final URL src;
    public final Map<String, String> headers;
    public final File dst;
    public final OnDownloadCompleted onDownloadCompleted;

    public DownloadParams(
            URL src,
            Map<String, String> headers,
            File dst,
            OnDownloadCompleted onDownloadCompleted) {
        this.src = src;
        this.headers = headers;
        this.dst = dst;
        this.onDownloadCompleted = onDownloadCompleted;
    }
}