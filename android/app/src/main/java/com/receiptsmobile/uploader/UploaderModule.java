package com.receiptsmobile.uploader;

import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;
import android.util.Log;
import com.facebook.react.bridge.*;

import java.io.File;
import java.io.InputStream;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static com.receiptsmobile.InputStreamToFile.streamToFile;

public class UploaderModule extends ReactContextBaseJavaModule {
    @Override
    public String getName() {
        return "ReceiptsUploader";
    }

    UploaderModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @ReactMethod
    public void submit(ReadableMap payload, Promise promise) {
        Context context = getCurrentActivity();

        String token = payload.getString("token");
        String url = payload.getString("uploadUrl");

        Set<String> uploads = new HashSet<>();
        ReadableArray contentUris = payload.getArray("files");

        for (int i = 0; i < contentUris.size(); i++) {
            uploads.add(contentUriToFile(contentUris.getString(i)));
        }

        new UploadJobsStorage(context).submitUploads(uploads, token, url);

        Intent intent = new Intent(context, UploadService.class);
        context.startService(intent);

        promise.resolve("started");
    }

    private String contentUriToFileExtension(Uri uri) {
        try {
            Cursor returnCursor =
                    getCurrentActivity().getContentResolver().query(uri, null, null, null, null);
            returnCursor.moveToFirst();
            int nameIndex = returnCursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);

            String fileName = returnCursor.getString(nameIndex);
            String[] splitted = fileName.split("\\.");
            return splitted.length > 0 ? splitted[splitted.length -1] : "";
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private String contentUriToFile(String uri) {

        try {
            Uri file = Uri.parse(uri);
            InputStream inputStream = getCurrentActivity().getContentResolver().openInputStream(file);
            File dst = new File(getCurrentActivity().getCacheDir(),
                    UUID.randomUUID().toString() + "." + contentUriToFileExtension(file));

            try {
                streamToFile(inputStream, dst);
                return dst.getAbsolutePath();
            } finally {
                inputStream.close();
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
