package com.receiptsmobile.db;

import android.provider.BaseColumns;

public class UploadJobEntryContract {

    public static class UploadJobEntry implements BaseColumns {
        public static final String TABLE_NAME = "uploads";
        public static final String COLUMN_NAME_UPLOAD_JOB_ID = "upload_job_id";
        public static final String COLUMN_NAME_UPLOAD_JOB = "upload_job";
        public static final String COLUMN_NAME_IS_COMPLETED = "is_completed";
        public static final String COLUMN_NAME_TIMESTAMP = "timestamp";
    }
}
