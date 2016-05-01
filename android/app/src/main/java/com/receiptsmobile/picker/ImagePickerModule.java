package com.receiptsmobile.picker;

import android.app.Activity;
import android.content.ClipData;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Log;
import com.facebook.react.bridge.*;

import java.io.*;
import java.util.UUID;

public class ImagePickerModule extends ReactContextBaseJavaModule implements ActivityEventListener {

    private static String TAG = "ImagePicker";
    private static int PICKER_CODE = 100;
    private static int PHOTO_CODE = 101;

    final Context reactContext;
    Promise currentPromise = null;
    Uri dstUri = null;

    @Override
    public String getName() {
        return "ImagePicker";
    }

    ImagePickerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        reactContext.addActivityEventListener(this);
    }

    @ReactMethod
    public void pick(Promise promise) {

        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("image/*");
        intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);

        if (intent.resolveActivity(getCurrentActivity().getPackageManager()) != null) {
            currentPromise = promise;
            getCurrentActivity().startActivityForResult(Intent.createChooser(intent,
                    "Select images"), PICKER_CODE);
        } else {
            promise.reject("NO_GALLERY_APP", "Gallery app is not installed");
        }
    }

    @ReactMethod
    public void takePhoto(Promise promise) {
        Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);

        File path = getCurrentActivity().getExternalCacheDir();
        File dst = new File(path, "image-" + UUID.randomUUID().toString() + ".jpg");
        try {
            path.mkdirs();
            dst.createNewFile();
        } catch (IOException e) {
            Log.e(TAG, "Can't create file " + dst);
            promise.reject(e);
            throw new RuntimeException();
        }

        dstUri = Uri.fromFile(dst);
        takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, dstUri);

        if (takePictureIntent.resolveActivity(getCurrentActivity().getPackageManager()) != null) {
            currentPromise = promise;
            getCurrentActivity().startActivityForResult(takePictureIntent, PHOTO_CODE);
        } else {
            promise.reject("NO_PHOTO_APP", "Photo app is not installed");
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        WritableArray result = Arguments.createArray();

        if (resultCode != Activity.RESULT_OK) {
            Log.i(TAG, "Activity resultCode is not OK (" + resultCode + ")");
            currentPromise.resolve(result);
            return;
        }

        if (requestCode == PICKER_CODE) {

            ClipData clipData = data.getClipData();

            if (clipData != null) {
                for (int i = 0; i < clipData.getItemCount(); i++) {
                    Uri photoUri = clipData.getItemAt(i).getUri();
                    result.pushMap(toImageInfo(photoUri));

                    Log.i("IMAGE PICKER", "photo: " + photoUri);
                }
            } else {
                Uri photoUri = data.getData();
                result.pushMap(toImageInfo(photoUri));
                Log.i("IMAGE PICKER", "photo: " + photoUri);
            }
        } else if (requestCode == PHOTO_CODE) {

            Log.i(TAG, "data " + data);

            result.pushMap(toImageInfo(dstUri));
            Log.i("IMAGE PICKER", "photo: " + dstUri);
        }

        currentPromise.resolve(result);
    }

    private WritableMap toImageInfo(Uri uri) {
        try {
            Log.i(TAG, "URI TO OPEN: " + uri);
            InputStream stream = reactContext.getContentResolver().openInputStream(uri);
            Bitmap photo = BitmapFactory.decodeStream(stream);
            stream.close();

            WritableMap image = Arguments.createMap();

            image.putString("uri", uri.toString());
            image.putInt("width", photo.getWidth());
            image.putInt("height", photo.getHeight());

            return image;
        } catch(Exception e) {
            throw new RuntimeException(e);
        }
    }

}
