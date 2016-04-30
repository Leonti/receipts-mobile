package com.receiptsmobile;

import java.io.*;

public class InputStreamToFile {

    public static void streamToFile(InputStream inputStream, File dst) {
        try {
            OutputStream output = new FileOutputStream(dst);
            try {
                byte[] buffer = new byte[4 * 1024]; // or other buffer size
                int read;

                while ((read = inputStream.read(buffer)) != -1) {
                    output.write(buffer, 0, read);
                }
                output.flush();
            } finally {
                output.close();
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
