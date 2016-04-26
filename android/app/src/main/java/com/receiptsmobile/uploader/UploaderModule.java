package com.receiptsmobile.uploader;

import android.content.Intent;
import com.facebook.react.bridge.*;

public class UploaderModule extends ReactContextBaseJavaModule {
    @Override
    public String getName() {
        return "ReceiptsUploader";
    }

    UploaderModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @ReactMethod
    public void submit(ReadableMap files, Promise promise) {

        Intent intent = new Intent(getCurrentActivity(), UploadService.class);
        getCurrentActivity().startService(intent);

        promise.resolve("started");
    }
}
