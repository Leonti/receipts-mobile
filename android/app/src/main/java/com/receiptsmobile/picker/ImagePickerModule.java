package com.receiptsmobile.picker;

import android.app.Activity;
import android.content.ClipData;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.Log;
import com.facebook.react.bridge.*;

import java.io.*;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

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

        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
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

    private void processImagesAsync(final Promise promise, final ClipData clipData, final Context context, final int takeFlags) {
        ExecutorService executor = Executors.newSingleThreadExecutor();

        executor.submit(new Runnable() {
            @Override
            public void run() {

                WritableMap result = Arguments.createMap();
                WritableArray images = Arguments.createArray();

                for (int i = 0; i < clipData.getItemCount(); i++) {
                    Uri photoUri = clipData.getItemAt(i).getUri();

                   // persistUriPermissions(context, photoUri, takeFlags);

                    images.pushString(photoUri.toString());

                    Log.i("IMAGE PICKER", "photo: " + photoUri);
                }

                result.putArray("multiple", images);
                promise.resolve(result);
            }
        });

        executor.shutdown();
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

    // ,make sure permissions persist after restart
    private void persistUriPermissions(Context context, Uri uri, int takeFlags) {
        context.getContentResolver().takePersistableUriPermission(uri, takeFlags);
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        if (requestCode != PICKER_CODE && requestCode != PHOTO_CODE) {
            return;
        }

        if (resultCode != Activity.RESULT_OK) {
            Log.i(TAG, "Activity resultCode is not OK (" + resultCode + ")");
            WritableMap result = Arguments.createMap();
            result.putBoolean("cancelled", true);
            currentPromise.resolve(result);
            return;
        }

        final int takeFlags = data.getFlags()
                & (Intent.FLAG_GRANT_READ_URI_PERMISSION
                | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);

        if (requestCode == PICKER_CODE) {

            ClipData clipData = data.getClipData();

            if (clipData != null) {
                processImagesAsync(currentPromise, clipData, activity, takeFlags);
            } else {
                Uri photoUri = data.getData();

              //  persistUriPermissions(activity, photoUri, takeFlags);

                WritableMap result = Arguments.createMap();
                result.putMap("single", toImageInfo(photoUri));
                Log.i("IMAGE PICKER", "photo: " + photoUri);
                currentPromise.resolve(result);
            }
        } else if (requestCode == PHOTO_CODE) {

            Log.i(TAG, "data " + data);

            WritableMap result = Arguments.createMap();
            result.putMap("single", toImageInfo(dstUri));
            Log.i("IMAGE PICKER", "photo: " + dstUri);
            currentPromise.resolve(result);
        }
    }

    @Override
    public void onNewIntent(Intent intent) {}

}
