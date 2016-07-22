import Api from '../services/Api';
import Receipt from '../services/Receipt';

export const CREATE_RECEIPT_REQUEST = 'CREATE_RECEIPT_REQUEST';
export const CREATE_RECEIPT_RESULT = 'CREATE_RECEIPT_RESULT';
export const CREATE_RECEIPT_REQUEST_FAILURE = 'CREATE_RECEIPT_REQUEST_FAILURE';

export const SAVE_RECEIPT_REQUEST = 'SAVE_RECEIPT_REQUEST';
export const SAVE_RECEIPT_RESULT = 'SAVE_RECEIPT_RESULT';
export const SAVE_RECEIPT_REQUEST_FAILURE = 'SAVE_RECEIPT_REQUEST_FAILURE';

export const DELETE_RECEIPT_REQUEST = 'DELETE_RECEIPT_REQUEST';
export const DELETE_RECEIPT_RESULT = 'DELETE_RECEIPT_RESULT';
export const DELETE_RECEIPT_REQUEST_FAILURE = 'DELETE_RECEIPT_REQUEST_FAILURE';

export const RECEIPT_LIST_REQUEST = 'RECEIPT_LIST_REQUEST';
export const RECEIPT_LIST_RESULT = 'RECEIPT_LIST_RESULT';
export const RECEIPT_LIST_REQUEST_FAILURE = 'RECEIPT_LIST_REQUEST_FAILURE';

export const SET_NEW_RECEIPT = 'SET_NEW_RECEIPT';

export const OPEN_DRAWER = 'OPEN_DRAWER'
export const CLOSE_DRAWER = 'CLOSE_DRAWER'

export const SET_OPENED_RECEIPT = 'SET_OPENED_RECEIPT';
export const SET_OPENED_RECEIPT_URI = 'SET_OPENED_RECEIPT_URI';
export const SET_OPENED_RECEIPT_URI_FAILURE = 'SET_OPENED_RECEIPT_URI_FAILED';

export const SET_IMAGE_VIEWER_IMAGE = 'SET_IMAGE_VIEWER_IMAGE';

export function createReceipt(imageUri, total, description) {

    return function(dispatch) {
        dispatch({
            type: CREATE_RECEIPT_REQUEST,
        });

        return Api.uploadFile(imageUri, total, description).then(result => {
            dispatch({
                type: CREATE_RECEIPT_RESULT,
                result,
            });
        }, error => {
            dispatch({
                type: CREATE_RECEIPT_REQUEST_FAILURE,
                error,
            });
        });
    }
}

export function batchCreateReceipts(imageUris) {

    return function(dispatch) {
        dispatch({
            type: CREATE_RECEIPT_REQUEST,
        });

        return Api.batchUpload(imageUris).then(result => {
            dispatch({
                type: CREATE_RECEIPT_RESULT,
                result,
            });
        }, error => {
            dispatch({
                type: CREATE_RECEIPT_REQUEST_FAILURE,
                error,
            });
        });
    }
}

export function saveReceipt(receiptId, total, description, postSaveAction) {

    return function(dispatch) {
        dispatch({
            type: SAVE_RECEIPT_REQUEST,
        });

        return Api.updateReceipt(receiptId, {
                total: total,
                description: description
            }).then(result => {
                dispatch({
                    type: SAVE_RECEIPT_RESULT,
                    result,
                })
                postSaveAction(result)
        }, error => {
            dispatch({
                type: SAVE_RECEIPT_REQUEST_FAILURE,
                error,
            });
        });
    }
}

export function deleteReceipt(receiptId, postDeleteAction) {

    return function(dispatch) {
        dispatch({
            type: DELETE_RECEIPT_REQUEST,
            receiptId: receiptId,
        });

        return Api.deleteReceipt(receiptId).then(result => {
                dispatch({
                    type: DELETE_RECEIPT_RESULT,
                    result,
                })
                postDeleteAction()
        }, error => {
            dispatch({
                type: DELETE_RECEIPT_REQUEST_FAILURE,
                error,
            });
        });
    }
}

export function loadReceipts() {

    return function(dispatch) {
        dispatch({
            type: RECEIPT_LIST_REQUEST,
        });

        return Api.getReceipts().then(result => {
            dispatch({
                type: RECEIPT_LIST_RESULT,
                result,
            });

            result.forEach(receipt => Receipt.receiptToImage(receipt));
        }, error => {
            dispatch({
                type: RECEIPT_LIST_REQUEST_FAILURE,
                error,
            });
        });
    }
}

export function openDrawer() {
    return {
        type: OPEN_DRAWER
    }
}

export function closeDrawer() {
    return {
        type: CLOSE_DRAWER
    }
}

export function setNewReceipt(image, total, description) {
    return {
        type: SET_NEW_RECEIPT,
        data: {
            image,
            total,
            description,
            thumbnail: Receipt.imageToThumbnailDimensions(image),
        }
    };
}

export function openReceipt(receipt) {

    return function(dispatch) {
        dispatch({
            type: SET_OPENED_RECEIPT,
            receipt: receipt,
            imageDimensions: Receipt.receiptToImageDimensions(receipt),
            thumbnailDimensions: Receipt.receiptToThumbnailDimensions(receipt),
        });

        return Receipt.receiptToImage(receipt).then(receiptImage => {
            dispatch({
                type: SET_OPENED_RECEIPT_URI,
                source: receiptImage.source,
            });
        }, error => {
            dispatch({
                type: SET_OPENED_RECEIPT_URI_FAILURE,
                error,
            });
        });
    }
}

export function setImageViewerImage(source, width, height) {
    return {
        type: SET_IMAGE_VIEWER_IMAGE,
        data: {
            source: source,
            width: width,
            height: height,
        }
    }
}
