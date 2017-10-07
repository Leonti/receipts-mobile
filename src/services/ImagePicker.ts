'use strict'

import { NativeModules } from 'react-native'

declare module 'react-native' {
  interface NativeModulesStatic {
    ImagePicker: {
      pick: () => Promise<any>,
      takePhoto: () => Promise<any>
    }
  }
}

export const ImagePicker = NativeModules.ImagePicker
