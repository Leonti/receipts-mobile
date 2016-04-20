package com.receiptsmobile.com.receiptsmobile.files;

public class DownloadResult {
    public final int statusCode;
    public final int bytesWritten;
    public final Exception exception;

    public DownloadResult(int statusCode, int bytesWritten, Exception exception) {
        this.statusCode = statusCode;
        this.bytesWritten = bytesWritten;
        this.exception = exception;
    }

    public static DownloadResult ok(int statusCode, int bytesWritten) {
        return new DownloadResult(statusCode, bytesWritten, null);
    }

    public static DownloadResult error(Exception exception) {
        return new DownloadResult(0, 0, exception);
    }
}
