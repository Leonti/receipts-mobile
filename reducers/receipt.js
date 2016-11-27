import { combineReducers } from 'redux'
import {
    CREATE_RECEIPT_REQUEST,
    CREATE_RECEIPT_RESULT,
    CREATE_RECEIPT_REQUEST_FAILURE,

    SAVE_RECEIPT_REQUEST,
    SAVE_RECEIPT_RESULT,
    SAVE_RECEIPT_REQUEST_FAILURE,

    DELETE_RECEIPT_CONFIRMATION,
    DELETE_RECEIPT_CONFIRMATION_OK,
    DELETE_RECEIPT_CONFIRMATION_CANCEL,

    DELETE_RECEIPT_REQUEST,
    DELETE_RECEIPT_RESULT,
    DELETE_RECEIPT_REQUEST_FAILURE,

    RECEIPT_LIST_REQUEST,
    RECEIPT_LIST_RESULT,
    RECEIPT_LIST_REQUEST_FAILURE,
    RECEIPT_LIST_MANUAL_REFRESH,
    RECEIPT_INTERVAL_REFRESH_START,
    RECEIPT_INTERVAL_REFRESH_STOP,

    SET_NEW_RECEIPT,

    OPEN_DRAWER,
    CLOSE_DRAWER,

    SET_OPENED_RECEIPT,
    SET_OPENED_RECEIPT_URI,
    SET_OPENED_RECEIPT_URI_FAILURE,

    START_EDITING_RECEIPT,
    STOP_EDITING_RECEIPT,

    UPDATE_OPENED_RECEIPT,
    UPDATE_NEW_RECEIPT,

    SET_IMAGE_VIEWER_IMAGE,
} from '../actions/receipt'

function doneReceipts(allReceipts, pendingFiles) {
    const pendingReceiptsIds = pendingFiles.map(pendingFile => pendingFile.receiptId);
    return allReceipts.filter(receipt => !pendingReceiptsIds.includes(receipt.id));
}

function receiptList(state = {
        isFetching: false,
        receipts: [],
        pendingFiles: [],
        drawerOpened: false,
        error: null,
        isRefreshInterval: false,
    }, action) {

    switch (action.type) {
        case RECEIPT_LIST_MANUAL_REFRESH:
            return Object.assign({}, state, {
                isFetching: true,
            });
        case RECEIPT_INTERVAL_REFRESH_START:
            return Object.assign({}, state, {
                isRefreshInterval: true,
            });
        case RECEIPT_INTERVAL_REFRESH_STOP:
            return Object.assign({}, state, {
                isRefreshInterval: false,
            });
        case RECEIPT_LIST_RESULT:
            return Object.assign({}, state, {
                isFetching: false,
                receipts: doneReceipts(action.result.receipts, action.result.pendingFiles),
                pendingFiles: action.result.pendingFiles,
            });
        case RECEIPT_LIST_REQUEST_FAILURE:
            return Object.assign({}, state, {
                isFetching: false,
                error: action.error,
            });
        case SAVE_RECEIPT_RESULT:
            return Object.assign({}, state, {
                receipts: updateReceipt(state.receipts, action.result),
            });
        case DELETE_RECEIPT_REQUEST:
            console.log('DELETE_RECEIPT_REQUEST in RECEIPT LIST');
            return Object.assign({}, state, {
                receipts: state.receipts.filter(receipt => receipt.id != action.receiptId),
            });
        case OPEN_DRAWER:
            return Object.assign({}, state, {
                drawerOpened: true
            });
        case CLOSE_DRAWER:
            return Object.assign({}, state, {
                drawerOpened: false
            });
        default:
          return state
    }
}

function updateReceipt(receipts, receipt) {
    return receipts.map(r => {
        if (r.id == receipt.id) {
            return receipt;
        }
        return r;
    });
}

function createReceipt(state = {
        isFetching: false,
        uploadIds: [],
        error: null,
    }, action) {

        switch (action.type) {
            case CREATE_RECEIPT_REQUEST:
                return Object.assign({}, state, {
                    isFetching: true,
                });
            case CREATE_RECEIPT_RESULT:
                return Object.assign({}, state, {
                    isFetching: false,
                    uploadIds: action.result,
                });
            case CREATE_RECEIPT_REQUEST_FAILURE:
                return Object.assign({}, state, {
                    isFetching: false,
                    error: action.error,
                });
            default:
              return state
        }
}

function saveReceipt(state = {
        isFetching: false,
        savedReceipt: null,
        error: null,
    }, action) {

        switch (action.type) {
            case SAVE_RECEIPT_REQUEST:
                return Object.assign({}, state, {
                    isFetching: true,
                });
            case SAVE_RECEIPT_RESULT:
                return Object.assign({}, state, {
                    isFetching: false,
                    savedReceipt: action.result,
                });
            case SAVE_RECEIPT_REQUEST_FAILURE:
                return Object.assign({}, state, {
                    isFetching: false,
                    error: action.error,
                });
            default:
              return state
        }
}

function deleteReceipt(state = {
        isFetching: false,
        deletionResult: false,
        isAskingConfirmation: false,
        confirmationResult: null,
        error: null,
    }, action) {

        switch (action.type) {
            case DELETE_RECEIPT_REQUEST:
                return Object.assign({}, state, {
                    isFetching: true,
                });
            case DELETE_RECEIPT_RESULT:
                return Object.assign({}, state, {
                    isFetching: false,
                    deletionResult: action.result,
                });
            case DELETE_RECEIPT_REQUEST_FAILURE:
                return Object.assign({}, state, {
                    isFetching: false,
                    error: action.error,
                });
            default:
              return state
        }
}

function newReceipt(state = {
        image: null,
        thumbnail: null,
        total: null,
        description: null,
        transactionTime: null,
        tags: null,
    }, action) {

        switch (action.type) {
            case SET_NEW_RECEIPT:
                return Object.assign({}, state, action.data);
            case UPDATE_NEW_RECEIPT:
                return Object.assign({}, state, action.data);
            default:
              return state
        }
}

function openedReceipt(state = {
        receipt: null,
        updatedReceipt: null,
        isBeingEdited: false,
        image: {
            source: null,
            width: null,
            height: null,
        },
        thumbnail: {
            width: null,
            height: null,
        },
        error: null,
    }, action) {

    switch (action.type) {
        case SET_OPENED_RECEIPT:
            return Object.assign({}, state, {
                receipt: action.receipt,
                updatedReceipt: action.receipt,
                image: {
                    width: action.imageDimensions.width,
                    height: action.imageDimensions.height,
                },
                thumbnail: {
                    width: action.thumbnailDimensions.width,
                    height: action.thumbnailDimensions.height,
                }
            });
        case SET_OPENED_RECEIPT_URI:
            return Object.assign({}, state, {
                image: {
                    source: action.source,
                    width: state.image.width,
                    height: state.image.height,
                }
            });
        case SET_OPENED_RECEIPT_URI_FAILURE:
            return Object.assign({}, state, {
                error: action.error,
            });
        case UPDATE_OPENED_RECEIPT:
            return Object.assign({}, state, {
                updatedReceipt: Object.assign({}, state.updatedReceipt, action.data),
            });
        case START_EDITING_RECEIPT:
            return Object.assign({}, state, {
                isBeingEdited: true,
            });
        case STOP_EDITING_RECEIPT:
            return Object.assign({}, state, {
                isBeingEdited: false,
            });
        default:
          return state
    }
}

function openedReceiptImage(state = {
        source: null,
        width: null,
        height: null,
    }, action) {

        switch (action.type) {
            case SET_OPENED_RECEIPT:
                return Object.assign({}, state, {
                    width: action.imageDimensions.width,
                    height: action.imageDimensions.height,
                });
            case SET_OPENED_RECEIPT_URI:
                return Object.assign({}, state, {
                    source: action.source
                });
            case SET_NEW_RECEIPT:
                return Object.assign({}, state, action.data.image);
            default:
              return state
        }
}

const rootReducer = combineReducers({
    receiptList,
    createReceipt,
    saveReceipt,
    deleteReceipt,
    newReceipt,
    openedReceipt,
    openedReceiptImage,
})

export default rootReducer
