import { connect } from 'react-redux';
import {
    navigateTo,
    navigateToAndReset,
    navigateBack,
 } from '../actions/navigation'

import {
    openDrawer,
    closeDrawer,
    loadReceipts,
    openReceipt,
    deleteReceipt,
    setNewReceipt,
    saveReceipt,
    createReceipt,
    batchCreateReceipts,
} from '../actions/receipt'

import {
    login,
    logout,
    createUser,
} from '../actions/user'

import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import HomePage from '../pages/HomePage';
import ReceiptViewPage from '../pages/ReceiptViewPage';
import ReceiptFormPage from '../pages/ReceiptFormPage';
import ImageViewer from '../components/ImageViewer';

export const LoginPageContainer = connect(
    (state) => {
        return {
            isFetching: state.user.login.isFetching,
            error: state.user.login.error,
        }
    },
    (dispatch) => {
        return {
            toSignup: () => {
                dispatch(navigateTo('SIGNUP'))
            },
            onLogin: (username, password) => {
                dispatch(login(username, password, () => {
                    dispatch(loadReceipts())
                    dispatch(navigateTo('RECEIPT_LIST'))
                }));
            }
        }
    }
)(LoginPage)

export const SignupPageContainer = connect(
    (state) => {
        return {
            isFetching: state.user.signup.isFetching,
            error: state.user.signup.error,
        }
    },
    (dispatch) => {
        return {
            toLogin: () => {
                dispatch(navigateTo('LOGIN'))
            },
            onSignup: (username, password) => {
                dispatch(createUser(username, password, () => {
                    dispatch(navigateTo('LOGIN'))
                }));
            }
        }
    }
)(SignupPage)

export const HomePageContainer = connect(
    (state) => {
        return {
            receipts: state.receipt.receiptList.receipts,
            isFetching: state.receipt.receiptList.isFetching,
            drawerOpened: state.receipt.receiptList.drawerOpened,
            error: state.receipt.receiptList.error,
            userName: state.user.login.user.userName,
        }
    },
    (dispatch) => {
        return {
            openDrawer: () => dispatch(openDrawer()),
            closeDrawer: () => dispatch(closeDrawer()),
            toReceipt: (receipt) => {
                dispatch(openReceipt(receipt));
                if (needToEdit(receipt)) {
                    dispatch(navigateTo('RECEIPT_EDIT'))
                } else {
                    dispatch(navigateTo('RECEIPT_VIEW'));
                }
            },
            onFileSelected: (image) => {
                dispatch(setNewReceipt(image, '', ''))
                dispatch(navigateTo('RECEIPT_CREATE'))
            },
            onFilesSelected: (imageUris) => {
                dispatch(batchCreateReceipts(imageUris))
            },
            onLogout: () => {
                dispatch(logout())
                dispatch(navigateTo('LOGIN'))
            },
            onRefresh: () => {
                dispatch(loadReceipts())
            }
        }
    }
)(HomePage)

function findPrevReceipt(receipts, receipt) {
    let index = receipts.findIndex(listReceipt => listReceipt.id === receipt.id);

    return index - 1 >= 0 ? receipts[index - 1] : null;
}

function findNextReceipt(receipts, receipt) {
    let index = receipts.findIndex(listReceipt => listReceipt.id === receipt.id);

    if (index === -1) {
        return null;
    }

    return index + 1 <= receipts.length - 1 ? receipts[index + 1] : null;
}

function needToEdit(receipt) {
    return receipt.total === null || receipt.total === undefined;
}

export const ReceiptViewPageContainer = connect(
    (state) => {
        return {
            receipt: state.receipt.openedReceipt.receipt,
            nextReceipt: findNextReceipt(state.receipt.receiptList.receipts, state.receipt.openedReceipt.receipt),
            prevReceipt: findPrevReceipt(state.receipt.receiptList.receipts, state.receipt.openedReceipt.receipt),
            image: state.receipt.openedReceipt.image,
            thumbnail: state.receipt.openedReceipt.thumbnail,
            error: state.receipt.openedReceipt.error,
            isDeleting: state.receipt.deleteReceipt.isFetching,
        }
    },
    (dispatch) => {
        return {
            onDelete: (receiptId) => {
                dispatch(deleteReceipt(receiptId, () => {
                    dispatch(loadReceipts())
                    dispatch(navigateTo('RECEIPT_LIST'))
                }))
            },
            onEdit: () => {
                dispatch(navigateTo('RECEIPT_EDIT'))
            },
            onClose: () => {
                dispatch(navigateTo('RECEIPT_LIST'))
            },
            toReceipt: (receipt) => {
                dispatch(openReceipt(receipt))
                if (needToEdit(receipt)) {
                    dispatch(navigateTo('RECEIPT_EDIT'))
                }
            },
            toImageViewer: () => {
                dispatch(navigateTo('RECEIPT_IMAGE'))
            },
        }
    }
)(ReceiptViewPage)

export const ReceiptEditPageContainer = connect(
    (state) => {
        return {
            receiptId: state.receipt.openedReceipt.receipt.id,
            nextReceipt: findNextReceipt(state.receipt.receiptList.receipts, state.receipt.openedReceipt.receipt),
            prevReceipt: findPrevReceipt(state.receipt.receiptList.receipts, state.receipt.openedReceipt.receipt),
            isSwipable: true,
            image: state.receipt.openedReceipt.image,
            thumbnail: state.receipt.openedReceipt.thumbnail,
            description: state.receipt.openedReceipt.receipt.description,
            total: state.receipt.openedReceipt.receipt.total,
            title: 'Edit Receipt',
        }
    },
    (dispatch) => {
        return {
            onSave: (receiptId, imageUri, receiptData) => {
                dispatch(saveReceipt(
                    receiptId,
                    receiptData.total,
                    receiptData.description,
                    () => {
                        dispatch(loadReceipts())
                        dispatch(navigateTo('RECEIPT_LIST'))
                    }
                ))
            },
            onClose: () => {
                dispatch(navigateTo('RECEIPT_LIST'))
            },
            toReceipt: (receipt) => {
                dispatch(openReceipt(receipt))
                if (!needToEdit(receipt)) {
                    dispatch(navigateTo('RECEIPT_VIEW'))
                }
            },
            toImageViewer: () => {
                dispatch(navigateTo('RECEIPT_IMAGE'))
            },
        }
    }
)(ReceiptFormPage)

export const ReceiptCreatePageContainer = connect(
    (state) => {
        return {
            image: state.receipt.newReceipt.image,
            thumbnail: state.receipt.newReceipt.thumbnail,
            isSwipable: false,
            description: state.receipt.newReceipt.description,
            total: state.receipt.newReceipt.total,
            title: 'New Receipt'
        }
    },
    (dispatch) => {
        return {
            onSave: (receiptId, imageUri, receiptData) => {
                dispatch(createReceipt(imageUri,
                    receiptData.total,
                    receiptData.description,
                ))
                dispatch(navigateTo('RECEIPT_LIST'))
            },
            onClose: () => {
                dispatch(navigateTo('RECEIPT_LIST'))
            },
            toImageViewer: () => {
                dispatch(navigateTo('RECEIPT_IMAGE'))
            },
        }
    }
)(ReceiptFormPage)

export const ImageViewerContainer = connect(
    (state) => {
        return {
            source: state.receipt.openedReceipt.image.source,
            imageWidth: state.receipt.openedReceipt.image.width,
            imageHeight: state.receipt.openedReceipt.image.height,
        }
    },
    (dispatch) => {
        return {
            onClose: () => {
                dispatch(navigateBack())
            },
        }
    }
)(ImageViewer)

const Routing = {
    LOGIN: LoginPageContainer,
    SIGNUP: SignupPageContainer,
    RECEIPT_LIST: HomePageContainer,
    RECEIPT_VIEW: ReceiptViewPageContainer,
    RECEIPT_CREATE: ReceiptCreatePageContainer,
    RECEIPT_EDIT: ReceiptEditPageContainer,
    RECEIPT_IMAGE: ImageViewerContainer,
};

export default Routing;
