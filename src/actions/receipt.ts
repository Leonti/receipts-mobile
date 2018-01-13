import Api, { Receipt, PendingFile } from '../services/Api'
import { default as ReceiptService } from '../services/Receipt'
import { SubmitUploadResult, ReceiptsUploader } from '../services/ReceiptsUploader'
import ReceiptCache from '../services/ReceiptCache'
import ReceiptPending from '../services/ReceiptPending'
import ReceiptSync from '../services/ReceiptSync'
import { ReceiptImageSource } from '../types'

export type Action = {
  type: 'CREATE_RECEIPT_REQUEST'
} | {
    type: 'CREATE_RECEIPT_RESULT',
    result: SubmitUploadResult
  } | {
    type: 'CREATE_RECEIPT_REQUEST_FAILURE',
    error: string
  } | {
    type: 'UPDATE_OPENED_RECEIPT',
    data: Receipt
  } | {
    type: 'UPDATE_NEW_RECEIPT',
    data: Receipt
  } | {
    type: 'START_EDITING_RECEIPT'
  } | {
    type: 'STOP_EDITING_RECEIPT'
  } | {
    type: 'SAVE_RECEIPT_REQUEST'
  } | {
    type: 'SAVE_RECEIPT_RESULT'
    result: {
      receiptId: string,
      delta: any
    }
  } | {
    type: 'SAVE_RECEIPT_REQUEST_FAILURE',
    error: string
  } | {
    type: 'DELETE_RECEIPT_REQUEST',
    receiptId: string
  } | {
    type: 'DELETE_RECEIPT_RESULT',
    result: any
  } | {
    type: 'DELETE_RECEIPT_REQUEST_FAILURE',
    error: string
  } | {
    type: 'RECEIPT_LIST_RESULT',
    result: {
      receipts: Receipt[],
      pendingFiles: PendingFile[]
    }
  } | {
    type: 'RECEIPT_LIST_MANUAL_REFRESH'
  } | {
    type: 'RECEIPT_LIST_REQUEST'
  } | {
    type: 'RECEIPT_LIST_RESULT',
    result
  } | {
    type: 'RECEIPT_LIST_REQUEST_FAILURE',
    error
  } | {
    type: 'RECEIPT_INTERVAL_REFRESH_START'
  } | {
    type: 'RECEIPT_INTERVAL_REFRESH_STOP'
  } | {
    type: 'OPEN_DRAWER'
  } | {
    type: 'CLOSE_DRAWER'
  } | {
    type: 'SET_NEW_RECEIPT',
    data: any
  } | {
    type: 'SET_OPENED_RECEIPT',
    receipt: Receipt,
    imageDimensions: any,
    thumbnailDimensions: any
  } | {
    type: 'SET_OPENED_RECEIPT_URI',
    source: ReceiptImageSource
  } | {
    type: 'SET_OPENED_RECEIPT_URI_FAILURE',
    error: string
  } | {
    type: 'SET_IMAGE_VIEWER_IMAGE',
    data: ReceiptImageSource
  }

export const createReceipt = (imageUri, total, description, transactionTime, tags) =>
  (dispatch: (_: Action) => void): Promise<void> => {

    dispatch({
      type: 'CREATE_RECEIPT_REQUEST'
    })

    return Api.uploadFile(imageUri, total, description, transactionTime, tags).then(result => {
      dispatch({
        type: 'CREATE_RECEIPT_RESULT',
        result
      })
    }, error => {

      console.log('ERROR UPLOADING', error)
      dispatch({
        type: 'CREATE_RECEIPT_REQUEST_FAILURE',
        error
      })
    })
  }

export const batchCreateReceipts = (imageUris) =>
  (dispatch: (_: Action) => void): Promise<void> => {

    dispatch({
      type: 'CREATE_RECEIPT_REQUEST'
    })

    return Api.batchUpload(imageUris).then(result => {
      dispatch({
        type: 'CREATE_RECEIPT_RESULT',
        result
      })
    }, error => {
      dispatch({
        type: 'CREATE_RECEIPT_REQUEST_FAILURE',
        error
      })
    })
  }

export const updateOpenedReceipt = (updatedFields): Action => {
  return {
    type: 'UPDATE_OPENED_RECEIPT',
    data: updatedFields
  }
}

export const updateNewReceipt = (updatedFields): Action => {
  return {
    type: 'UPDATE_NEW_RECEIPT',
    data: updatedFields
  }
}

export const startEditingReceipt = (): Action => {
  return {
    type: 'START_EDITING_RECEIPT'
  }
}

export const stopEditingReceipt = (): Action => {
  return {
    type: 'STOP_EDITING_RECEIPT'
  }
}

export const saveReceipt = (
  receiptId,
  total,
  description,
  transactionTime,
  tags,
  postSaveAction) =>
  (dispatch: (_: Action) => void): Promise<void> => {

    dispatch({
      type: 'SAVE_RECEIPT_REQUEST'
    })

    const delta = {
      total,
      description,
      transactionTime,
      tags
    }

    console.log(delta)

    async function performUpdate() {
      await ReceiptPending.add(receiptId, delta)
      const cachedReceipts = await ReceiptCache.getCachedReceipts()
      const updatedCached = ReceiptService.updateReceipt(cachedReceipts, receiptId, delta)
      await ReceiptCache.cacheReceipts(updatedCached)

      return updatedCached.find(r => r.id === receiptId)
    }

    return performUpdate().then(updatedReceipt => {
      dispatch({
        type: 'SAVE_RECEIPT_RESULT',
        result: {
          receiptId,
          delta
        }
      })

      postSaveAction(updatedReceipt)
    }, error => {
      console.log('Failed to save receipt', error)
      dispatch({
        type: 'SAVE_RECEIPT_REQUEST_FAILURE',
        error
      })
    })
  }

export const deleteReceipt = (receiptId, postDeleteAction) =>
  (dispatch: (_: Action) => void): Promise<void> => {

    dispatch({
      type: 'DELETE_RECEIPT_REQUEST',
      receiptId: receiptId
    })

    return Api.deleteReceipt(receiptId).then(result => {
      dispatch({
        type: 'DELETE_RECEIPT_RESULT',
        result
      })

      ReceiptCache.removeReceipt(receiptId)

      postDeleteAction()
    }, error => {
      dispatch({
        type: 'DELETE_RECEIPT_REQUEST_FAILURE',
        error
      })
    })
  }

export const loadCachedReceipts = () =>
  (dispatch: (_: Action) => void): Promise<void> => {

    return ReceiptService.cachedReceipts()
      .then(receipts => {
        dispatch({
          type: 'RECEIPT_LIST_RESULT',
          result: {
            receipts: receipts,
            pendingFiles: []
          }
        })
      })
  }

export const refeshReceiptListManually = () => refreshReceiptList('RECEIPT_LIST_MANUAL_REFRESH')

export const loadReceipts = () => refreshReceiptList('RECEIPT_LIST_REQUEST')

const refreshReceiptList = (onStartActionType) =>
  (dispatch: (_: Action) => void): Promise<void> => {

    dispatch({
      type: onStartActionType
    })

    // wake up uploads service
    ReceiptsUploader.currentUploads().then((uploads) => {
      console.log(uploads)
    }, (e) => console.log(e))

    return ReceiptSync.sync().then(result => {

      dispatch({
        type: 'RECEIPT_LIST_RESULT',
        result
      })

    }, error => {
      console.log('error fetching receipts', error)
      dispatch({
        type: 'RECEIPT_LIST_REQUEST_FAILURE',
        error
      })
    })
  }

export const receiptIntervalRefreshStart = (): Action => {
  return {
    type: 'RECEIPT_INTERVAL_REFRESH_START'
  }
}

export const receiptIntervalRefreshStop = (): Action => {
  return {
    type: 'RECEIPT_INTERVAL_REFRESH_STOP'
  }
}

export const openDrawer = (): Action => {
  return {
    type: 'OPEN_DRAWER'
  }
}

export const closeDrawer = (): Action => {
  return {
    type: 'CLOSE_DRAWER'
  }
}

export const setNewReceipt = (image, total, description): Action => {
  return {
    type: 'SET_NEW_RECEIPT',
    data: {
      image,
      total,
      description,
      thumbnail: ReceiptService.imageToThumbnailDimensions(image)
    }
  }
}

export const openReceipt = (receipt) =>
  (dispatch: (_: Action) => void): Promise<void> => {

    dispatch({
      type: 'SET_OPENED_RECEIPT',
      receipt: receipt,
      imageDimensions: ReceiptService.receiptToImageDimensions(receipt),
      thumbnailDimensions: ReceiptService.receiptToThumbnailDimensions(receipt)
    })

    return ReceiptService.receiptToImage(receipt).then(receiptImageSource => {
      dispatch({
        type: 'SET_OPENED_RECEIPT_URI',
        source: receiptImageSource
      })
    }, error => {
      dispatch({
        type: 'SET_OPENED_RECEIPT_URI_FAILURE',
        error
      })
    })
  }

export const setImageViewerImage = (source, width, height): Action => {
  return {
    type: 'SET_IMAGE_VIEWER_IMAGE',
    data: {
      source: source,
      width: width,
      height: height
    }
  }
}
