package com.receiptsmobile.files;

import android.util.Log;
import com.receiptsmobile.uploader.ReceiptUploader;

import java.util.Map;
import java.util.UUID;

public class DownloadJob {

    public final UUID id;
    public final String src;
    public final Map<String, String> headers;
    public final String dst;

    public DownloadJob(UUID id, String src, Map<String, String> headers, String dst) {
        this.id = id;
        this.src = src;
        this.headers = headers;
        this.dst = dst;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        DownloadJob job = (DownloadJob) o;

        if (!src.equals(job.src)) return false;
        if (!dst.equals(job.dst)) return false;

        return headers.equals(job.headers);
    }

    @Override
    public int hashCode() {
        int result = src.hashCode();
        result = 31 * result + dst.hashCode();
        result = 31 * result + headers.hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "DownloadJob{" +
                "id=" + id +
                ", src='" + src + '\'' +
                ", dst='" + dst + '\'' +
                ", headers=" + headers +
                '}';
    }
}
