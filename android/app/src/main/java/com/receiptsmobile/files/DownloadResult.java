package com.receiptsmobile.files;

public class DownloadResult {
    public final int statusCode;
    public final long bytesWritten;
    public final Exception exception;

    public DownloadResult(int statusCode, long bytesWritten, Exception exception) {
        this.statusCode = statusCode;
        this.bytesWritten = bytesWritten;
        this.exception = exception;
    }

    public static DownloadResult ok(int statusCode, long bytesWritten) {
        return new DownloadResult(statusCode, bytesWritten, null);
    }

    public static DownloadResult error(Exception exception) {
        return new DownloadResult(0, 0, exception);
    }
}
