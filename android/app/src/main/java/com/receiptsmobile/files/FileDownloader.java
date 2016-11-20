package com.receiptsmobile.files;

import java.io.*;

import android.util.Log;
import com.facebook.react.modules.network.OkHttpClientProvider;
import okhttp3.*;
import okio.BufferedSink;
import okio.Okio;

public class FileDownloader implements Runnable {
    private static String TAG = "FILE DOWNLOADER";

    private final DownloadParams params;

    public FileDownloader(DownloadParams params) {
        this.params = params;
    }

    @Override
    public void run() {

        try {
            OkHttpClient client = OkHttpClientProvider.getOkHttpClient();

            Request.Builder builder = new Request.Builder().url(params.src.toString());
            for (String key : params.headers.keySet()) {
                builder.addHeader(key, params.headers.get(key));
            }

            client.newCall(builder.build()).enqueue(new okhttp3.Callback() {

                @Override
                public void onFailure(Call call, IOException e) {
                    params.onDownloadCompleted.onDownloadCompleted(DownloadResult.error(e));
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    File tmpDst = new File(params.dst.getAbsolutePath() + ".part");

                    BufferedSink sink = Okio.buffer(Okio.sink(tmpDst));
                    sink.writeAll(response.body().source());
                    sink.close();
                    response.body().close();

                    tmpDst.renameTo(params.dst);
                    Log.i(TAG, "File downloaded and saved to '" + params.dst.getAbsolutePath() + "'");

                    params.onDownloadCompleted.onDownloadCompleted(DownloadResult.ok(response.code(), params.dst.length()));
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Exception downloading a file", e);
            params.onDownloadCompleted.onDownloadCompleted(DownloadResult.error(e));
        }

    }
}
