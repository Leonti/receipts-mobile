package com.receiptsmobile;

import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.facebook.react.ReactActivity;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import java.util.Arrays;
import java.util.List;

import com.receiptsmobile.files.NetworkFilesPackage;
import com.receiptsmobile.picker.ImagePickerPackage;
import com.receiptsmobile.uploader.UploaderPackage;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "ReceiptsMobile";
    }

}
