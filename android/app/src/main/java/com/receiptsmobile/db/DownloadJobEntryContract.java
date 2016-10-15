package com.receiptsmobile.db;

import android.provider.BaseColumns;

public class DownloadJobEntryContract {

    public static class DownloadJobEntry implements BaseColumns {
        public static final String TABLE_NAME = "downloads";
        public static final String COLUMN_NAME_JOB_ID = "download_job_id";
        public static final String COLUMN_NAME_JOB = "download_job";
        public static final String COLUMN_NAME_IS_COMPLETED = "is_completed";
        public static final String COLUMN_NAME_TIMESTAMP = "timestamp";
    }
}
