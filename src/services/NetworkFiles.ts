'use strict'

import { NativeModules } from 'react-native'

export type DownloadParams = {
  force: boolean,
  url: string,
  headers: {
    'Authorization': string
  }
}

declare module 'react-native' {

  interface NativeModulesStatic {
    NetworkFiles: {
      download: (downloadParams: DownloadParams) => Promise<any>
    }
  }
}

export const NetworkFiles = NativeModules.NetworkFiles
