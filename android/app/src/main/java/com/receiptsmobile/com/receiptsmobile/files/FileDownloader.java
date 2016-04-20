package com.receiptsmobile.com.receiptsmobile.files;

import java.io.*;
import java.net.HttpURLConnection;
import android.os.AsyncTask;
import android.util.Log;

public class FileDownloader extends AsyncTask<Void, int[], DownloadResult> {
    private final DownloadParams params;

    public FileDownloader(DownloadParams params) {
        this.params = params;
    }

    protected DownloadResult doInBackground(Void... ignored) {
        DownloadResult result = download();
        params.onDownloadCompleted.onDownloadCompleted(result);
        return result;
    }

    private DownloadResult download() {
        InputStream input = null;
        OutputStream output = null;
        HttpURLConnection connection = null;

        File tmpDst = new File(params.dst.getAbsolutePath() + ".part");

        try {
            connection = (HttpURLConnection) params.src.openConnection();

            for (String key : params.headers.keySet()) {
                connection.setRequestProperty(key, params.headers.get(key));
            }

            connection.setConnectTimeout(5000);
            connection.connect();

            int statusCode = connection.getResponseCode();
            int lengthOfFile = connection.getContentLength();

            Log.i("FILE DOWNLOADER", "Downloading a file with status code " + statusCode
            + " and file length " + lengthOfFile);

            input = new BufferedInputStream(connection.getInputStream(), 8 * 1024);

            output = new FileOutputStream(params.dst);

            byte data[] = new byte[8 * 1024];
            int total = 0;
            int count;

            while ((count = input.read(data)) != -1) {
                total += count;
                publishProgress(new int[] { lengthOfFile, total });
                output.write(data, 0, count);
            }

            output.flush();

            tmpDst.renameTo(params.dst);
            Log.i("FILE DOWNLOADER", "File downloaded and saved to '" + params.dst.getAbsolutePath() + "'");
            return DownloadResult.ok(statusCode, total);
        } catch(Exception e) {
            return DownloadResult.error(e);
        } finally {
            try {
                if (output != null) output.close();
                if (input != null) input.close();
                if (connection != null) connection.disconnect();
            } catch (IOException e) {
                Log.e("FileDownloader",
                        "Exception while closing file downloader task " + e.getStackTrace());
            }

        }
    }

    @Override
    protected void onProgressUpdate(int[]... values) {
        super.onProgressUpdate(values);
    }
}
