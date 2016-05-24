import { connect } from 'react-redux';
import {
    navigateToReceiptList,
    navigateToSignup,
    navigateToLogin,
    navigateToReceiptView,
    navigateToReceiptEdit,
    navigateToReceiptCreate,
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
                dispatch(navigateToSignup())
            },
            onLogin: (username, password) => {
                dispatch(login(username, password, () => {
                    dispatch(loadReceipts())
                    dispatch(navigateToReceiptList())
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
                dispatch(navigateToLogin())
            },
            onSignup: (username, password) => {
                dispatch(createUser(username, password, () => {
                    dispatch(navigateToLogin())
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
            toCreateReceipt: (newReceiptData) => {
                dispatch();
            },
            toEditReceipt: () => {

            },
            toViewReceipt: (receipt) => {
                dispatch(openReceipt(receipt));
                dispatch(navigateToReceiptView());
            },
            onFileSelected: (image) => {
                dispatch(setNewReceipt(image, '', ''))
                dispatch(navigateToReceiptCreate())
            },
            onFilesSelected: (imageUris) => {
                dispatch(batchCreateReceipts(imageUris))
            },
            onLogout: () => {
                dispatch(logout())
                dispatch(navigateToLogin())
            }
        }
    }
)(HomePage)

export const ReceiptViewPageContainer = connect(
    (state) => {
        return {
            receipt: state.receipt.openedReceipt.receipt,
            nextReceipt: state.receipt.openedReceipt.receipt,
            prevReceipt: state.receipt.openedReceipt.receipt,
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
                    dispatch(navigateToReceiptList())
                }))
            },
            onEdit: () => {
                dispatch(navigateToReceiptEdit())
            },
            onClose: () => {
                dispatch(navigateToReceiptList())
            },
            toReceipt: (receipt) => {
                dispatch(openReceipt(receipt))
            },
        }
    }
)(ReceiptViewPage)

export const ReceiptEditPageContainer = connect(
    (state) => {
        return {
            receiptId: state.receipt.openedReceipt.receipt.id,
            nextReceipt: state.receipt.openedReceipt.receipt,
            prevReceipt: state.receipt.openedReceipt.receipt,
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
                        dispatch(navigateToReceiptList())
                    }
                ))
            },
            onClose: () => {
                dispatch(navigateToReceiptList())
            },
            toReceipt: (receipt) => {
                dispatch(openReceipt(receipt))
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
                dispatch(navigateToReceiptList())
            },
            onClose: () => {
                dispatch(navigateToReceiptList())
            }
        }
    }
)(ReceiptFormPage)

const Routing = {
    LOGIN: LoginPageContainer,
    SIGNUP: SignupPageContainer,
    RECEIPT_LIST: HomePageContainer,
    RECEIPT_VIEW: ReceiptViewPageContainer,
    RECEIPT_CREATE: ReceiptCreatePageContainer,
    RECEIPT_EDIT: ReceiptEditPageContainer,
};

export default Routing;
