import { combineReducers } from 'redux'
import { Action } from '../actions/receipt'
import { Store } from '../store'

import Receipt from '../services/Receipt'

function doneReceipts(allReceipts, pendingFiles) {
  const pendingReceiptsIds = pendingFiles.map(pendingFile => pendingFile.receiptId)
  return allReceipts.filter(receipt => !pendingReceiptsIds.includes(receipt.id))
}

function receiptList(state: Store.ReceiptListState = {
  isFetching: false,
  receipts: [],
  pendingFiles: [],
  drawerOpened: false,
  error: undefined,
  isRefreshInterval: false
}, action: Action) {

  switch (action.type) {
    case 'RECEIPT_LIST_MANUAL_REFRESH':
      return Object.assign({}, state, {
        isFetching: true
      })
    case 'RECEIPT_INTERVAL_REFRESH_START':
      return Object.assign({}, state, {
        isRefreshInterval: true
      })
    case 'RECEIPT_INTERVAL_REFRESH_STOP':
      return Object.assign({}, state, {
        isRefreshInterval: false
      })
    case 'RECEIPT_LIST_RESULT':
      return Object.assign({}, state, {
        isFetching: false,
        receipts: doneReceipts(action.result.receipts, action.result.pendingFiles),
        pendingFiles: action.result.pendingFiles
      })
    case 'RECEIPT_LIST_REQUEST_FAILURE':
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      })
    case 'SAVE_RECEIPT_RESULT':
      return Object.assign({}, state, {
        receipts: Receipt.updateReceipt(state.receipts,
          action.result.receiptId, action.result.delta)
      })
    case 'DELETE_RECEIPT_REQUEST':
      console.log('DELETE_RECEIPT_REQUEST in RECEIPT LIST')
      return Object.assign({}, state, {
        receipts: state.receipts.filter(receipt => receipt.id !== action.receiptId)
      })
    case 'OPEN_DRAWER':
      return Object.assign({}, state, {
        drawerOpened: true
      })
    case 'CLOSE_DRAWER':
      return Object.assign({}, state, {
        drawerOpened: false
      })
    default:
      return state
  }
}

function createReceipt(state: Store.CreateReceiptState = {
  isFetching: false,
  uploadIds: [],
  error: undefined
}, action: Action) {

  switch (action.type) {
    case 'CREATE_RECEIPT_REQUEST':
      return Object.assign({}, state, {
        isFetching: true
      })
    case 'CREATE_RECEIPT_RESULT':
      return Object.assign({}, state, {
        isFetching: false,
        uploadIds: action.result
      })
    case 'CREATE_RECEIPT_REQUEST_FAILURE':
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      })
    default:
      return state
  }
}

function saveReceipt(state: Store.SaveReceiptState = {
  isFetching: false,
  savedReceipt: undefined,
  error: undefined
}, action: Action) {

  switch (action.type) {
    case 'SAVE_RECEIPT_REQUEST':
      return Object.assign({}, state, {
        isFetching: true
      })
    case 'SAVE_RECEIPT_RESULT':
      return Object.assign({}, state, {
        isFetching: false,
        savedReceipt: action.result
      })
    case 'SAVE_RECEIPT_REQUEST_FAILURE':
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      })
    default:
      return state
  }
}

function deleteReceipt(state: Store.DeleteReceiptState = {
  isFetching: false,
  deletionResult: false,
  isAskingConfirmation: false,
  confirmationResult: undefined,
  error: undefined
}, action: Action) {

  switch (action.type) {
    case 'DELETE_RECEIPT_REQUEST':
      return Object.assign({}, state, {
        isFetching: true
      })
    case 'DELETE_RECEIPT_RESULT':
      return Object.assign({}, state, {
        isFetching: false,
        deletionResult: action.result
      })
    case 'DELETE_RECEIPT_REQUEST_FAILURE':
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      })
    default:
      return state
  }
}

function newReceipt(state: Store.NewReceiptState = {
  image: undefined,
  thumbnail: undefined,
  total: undefined,
  description: undefined,
  transactionTime: undefined,
  tags: undefined
}, action: Action) {

  switch (action.type) {
    case 'SET_NEW_RECEIPT':
      return Object.assign({}, state, action.data)
    case 'UPDATE_NEW_RECEIPT':
      return Object.assign({}, state, action.data)
    default:
      return state
  }
}

function openedReceipt(state: Store.OpenedReceiptState = {
  receipt: undefined,
  updatedReceipt: undefined,
  isBeingEdited: false,
  image: undefined,
  thumbnail: undefined,
  error: undefined
}, action: Action) {

  switch (action.type) {
    case 'SET_OPENED_RECEIPT':
      return Object.assign({}, state, {
        receipt: action.receipt,
        updatedReceipt: action.receipt,
        image: {
          width: action.imageDimensions.width,
          height: action.imageDimensions.height
        },
        thumbnail: {
          width: action.thumbnailDimensions.width,
          height: action.thumbnailDimensions.height
        }
      })
    case 'SET_OPENED_RECEIPT_URI':
      return Object.assign({}, state, {
        image: {
          source: action.source,
          width: state.image.width,
          height: state.image.height
        }
      })
    case 'SET_OPENED_RECEIPT_URI_FAILURE':
      return Object.assign({}, state, {
        error: action.error
      })
    case 'UPDATE_OPENED_RECEIPT':
      return Object.assign({}, state, {
        updatedReceipt: Object.assign({}, state.updatedReceipt, action.data)
      })
    case 'START_EDITING_RECEIPT':
      return Object.assign({}, state, {
        isBeingEdited: true
      })
    case 'STOP_EDITING_RECEIPT':
      return Object.assign({}, state, {
        isBeingEdited: false
      })
    default:
      return state
  }
}

function openedReceiptImage(state: Store.OpenedReceiptImageState = {
  source: undefined,
  width: undefined,
  height: undefined
}, action: Action) {

  switch (action.type) {
    case 'SET_OPENED_RECEIPT':
      return Object.assign({}, state, {
        width: action.imageDimensions.width,
        height: action.imageDimensions.height
      })
    case 'SET_OPENED_RECEIPT_URI':
      return Object.assign({}, state, {
        source: action.source
      })
    case 'SET_NEW_RECEIPT':
      return Object.assign({}, state, action.data.image)
    default:
      return state
  }
}

const rootReducer = combineReducers<Store.ReceiptState>({
  receiptList,
  createReceipt,
  saveReceipt,
  deleteReceipt,
  newReceipt,
  openedReceipt,
  openedReceiptImage
})

export default rootReducer
