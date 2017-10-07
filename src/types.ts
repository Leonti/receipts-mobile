import {
  ImageURISource
} from 'react-native'

export type Thumbnail = {
  width: number,
  height: number
}

export type ReceiptImageSource = ImageURISource

export type ReceiptImage = {
  source: ImageURISource,
  width: number,
  height: number
}
