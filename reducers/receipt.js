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

    SET_NEW_RECEIPT,

    OPEN_DRAWER,
    CLOSE_DRAWER,

    SET_OPENED_RECEIPT,
    SET_OPENED_RECEIPT_URI,
    SET_OPENED_RECEIPT_URI_FAILURE,
} from '../actions/receipt'

function receiptList(state = {
        isFetching: false,
        receipts: [],
        drawerOpened: false,
        error: null,
    }, action) {

    switch (action.type) {
        case RECEIPT_LIST_REQUEST:
            return Object.assign({}, state, {
                isFetching: true,
            });
        case RECEIPT_LIST_RESULT:
            return Object.assign({}, state, {
                isFetching: false,
                receipts: action.result.slice(0, 10),
            });
        case RECEIPT_LIST_REQUEST_FAILURE:
            return Object.assign({}, state, {
                isFetching: false,
                error: action.error,
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
            case DELETE_RECEIPT_CONFIRMATION:
                return Object.assign({}, state, {
                    isAskingConfirmation: true,
                });
            case DELETE_RECEIPT_CONFIRMATION_OK:
                return Object.assign({}, state, {
                    isAskingConfirmation: false,
                    confirmationResult: 'OK',
                });
            case DELETE_RECEIPT_CONFIRMATION_CANCEL:
                return Object.assign({}, state, {
                    isAskingConfirmation: false,
                    confirmationResult: 'CANCEL',
                });
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
    }, action) {

        switch (action.type) {
            case SET_NEW_RECEIPT:
                return Object.assign({}, state, action.data);
            default:
              return state
        }
}

function openedReceipt(state = {
        receipt: null,
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
                    height: state.image.width,
                }
            });
        case SET_OPENED_RECEIPT_URI_FAILURE:
            return Object.assign({}, state, {
                error: action.error,
            });
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
})

export default rootReducer
