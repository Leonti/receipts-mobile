package com.receiptsmobile.db;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import com.receiptsmobile.db.UploadJobEntryContract.*;

public class UploadJobEntryDbHelper extends SQLiteOpenHelper {

    private static final String TEXT_TYPE = " TEXT";
    private static final String INTEGER_TYPE = " INTEGER";
    private static final String COMMA_SEP = ",";
    private static final String SQL_CREATE_ENTRIES =
            "CREATE TABLE " + UploadJobEntry.TABLE_NAME + " (" +
                    UploadJobEntry._ID + " INTEGER PRIMARY KEY," +
                    UploadJobEntry.COLUMN_NAME_UPLOAD_JOB_ID + TEXT_TYPE + COMMA_SEP +
                    UploadJobEntry.COLUMN_NAME_UPLOAD_JOB + TEXT_TYPE + COMMA_SEP +
                    UploadJobEntry.COLUMN_NAME_IS_COMPLETED + INTEGER_TYPE + " NOT NULL DEFAULT 0" + COMMA_SEP +
                    UploadJobEntry.COLUMN_NAME_TIMESTAMP + INTEGER_TYPE + " NOT NULL)";

    private static final String SQL_DELETE_ENTRIES =
            "DROP TABLE IF EXISTS " + UploadJobEntry.TABLE_NAME;


    // If you change the database schema, you must increment the database version.
    public static final int DATABASE_VERSION = 1;
    public static final String DATABASE_NAME = "upload_jobs.db";

    public UploadJobEntryDbHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    public void onCreate(SQLiteDatabase db) {
        db.execSQL(SQL_CREATE_ENTRIES);
    }

    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL(SQL_DELETE_ENTRIES);
        onCreate(db);
    }
    public void onDowngrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        onUpgrade(db, oldVersion, newVersion);
    }

}
