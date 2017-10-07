'use strict'

import { NativeModules } from 'react-native'

export type SubmitUploadResult = {
  jobs: string[]
}

declare module 'react-native' {

  type ReceiptToUpload = {
    uri: string,
    fields: {
      total: string,
      description: string,
      transactionTime: string,
      tags: string
    }
  }

  type UploadData = {
    token: string,
    uploadUrl: any,
    receipts: ReceiptToUpload[]
  }

  interface NativeModulesStatic {
    ReceiptsUploader: {
      submit: (uploadData: UploadData) => Promise<SubmitUploadResult>,
      currentUploads: () => Promise<any>
    }
  }
}

export const ReceiptsUploader = NativeModules.ReceiptsUploader
