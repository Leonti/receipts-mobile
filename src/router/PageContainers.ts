import { connect } from 'react-redux'
import {
  navigateTo,
  navigateBack
} from '../actions/navigation'

import {
  openDrawer,
  closeDrawer,
  openReceipt,
  updateOpenedReceipt,
  deleteReceipt,
  setNewReceipt,
  updateNewReceipt,
  startEditingReceipt,
  stopEditingReceipt,
  saveReceipt,
  createReceipt,
  batchCreateReceipts,
  refeshReceiptListManually,
  receiptIntervalRefreshStart,
  receiptIntervalRefreshStop
} from '../actions/receipt'

import {
  logout
} from '../actions/user'

import HomePage, { HomePageProps, HomePageDispatch } from '../pages/HomePage'
import ReceiptViewPage from '../pages/ReceiptViewPage'
import ReceiptFormPage from '../pages/ReceiptFormPage'
import ImageViewer from '../components/ImageViewer'

import { All } from '../store'

export const homePageContainer = connect(
  (state: All): HomePageProps => {
    return {
      receipts: state.receipt.receiptList.receipts,
      pendingCount: state.receipt.receiptList.pendingFiles.length,
      isFetching: state.receipt.receiptList.isFetching,
      drawerOpened: state.receipt.receiptList.drawerOpened,
      error: state.receipt.receiptList.error,
      userName: state.user.login.user.userName
    }
  },
  (dispatch): HomePageDispatch => {

    return {
      openDrawer: () => dispatch(openDrawer()),
      closeDrawer: () => dispatch(closeDrawer()),
      toReceipt: (receipt) => {
        dispatch(openReceipt(receipt))
        if (needToEdit(receipt)) {
          dispatch(startEditingReceipt())
          dispatch(navigateTo('RECEIPT_EDIT'))
        } else {
          dispatch(stopEditingReceipt())
          dispatch(navigateTo('RECEIPT_VIEW'))
        }
      },
      onFileSelected: (image) => {
        dispatch(stopEditingReceipt())
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
        dispatch(refeshReceiptListManually())
      },
      onMount: () => {
        dispatch(receiptIntervalRefreshStart())
      },
      onUnmount: () => {
        dispatch(receiptIntervalRefreshStop())
      }
    }
  }
)(HomePage)

function findPrevReceipt(receipts, receipt) {
  let index = receipts.findIndex(listReceipt => listReceipt.id === receipt.id)

  return index - 1 >= 0 ? receipts[index - 1] : undefined
}

function findNextReceipt(receipts, receipt) {
  let index = receipts.findIndex(listReceipt => listReceipt.id === receipt.id)

  if (index === -1) {
    return undefined
  }

  return index + 1 <= receipts.length - 1 ? receipts[index + 1] : undefined
}

function needToEdit(receipt) {
  return receipt.total === null || receipt.total === undefined
}

export const receiptViewPageContainer = connect(
  (state: any) => {
    return {
      receipt: state.receipt.openedReceipt.receipt,
      nextReceipt: findNextReceipt(state.receipt.receiptList.receipts, state.receipt.openedReceipt.receipt),
      prevReceipt: findPrevReceipt(state.receipt.receiptList.receipts, state.receipt.openedReceipt.receipt),
      image: state.receipt.openedReceipt.image,
      thumbnail: state.receipt.openedReceipt.thumbnail,
      error: state.receipt.openedReceipt.error,
      isDeleting: state.receipt.deleteReceipt.isFetching
    }
  },
  (dispatch) => {
    return {
      onDelete: (receiptId) => {
        dispatch(deleteReceipt(receiptId, () => {
          dispatch(navigateTo('RECEIPT_LIST'))
        }))
      },
      onEdit: () => {
        dispatch(startEditingReceipt())
        dispatch(navigateTo('RECEIPT_EDIT'))
      },
      onClose: () => {
        dispatch(navigateTo('RECEIPT_LIST'))
      },
      toReceipt: (receipt) => {
        dispatch(openReceipt(receipt))
        if (needToEdit(receipt)) {
          dispatch(startEditingReceipt())
          dispatch(navigateTo('RECEIPT_EDIT'))
        }
      },
      toImageViewer: () => {
        dispatch(navigateTo('RECEIPT_IMAGE'))
      }
    }
  }
)(ReceiptViewPage)

export const receiptEditPageContainer = connect(
  (state: any) => {

    const existingTags = state.receipt.openedReceipt.updatedReceipt.tags
    const tags = existingTags ? existingTags : []

    return {
      receiptId: state.receipt.openedReceipt.receipt.id,
      nextReceipt: findNextReceipt(state.receipt.receiptList.receipts, state.receipt.openedReceipt.receipt),
      prevReceipt: findPrevReceipt(state.receipt.receiptList.receipts, state.receipt.openedReceipt.receipt),
      isFetching: state.receipt.saveReceipt.isFetching,
      isDeleting: state.receipt.deleteReceipt.isFetching,
      isSwipable: true,
      image: state.receipt.openedReceipt.image,
      thumbnail: state.receipt.openedReceipt.thumbnail,
      description: state.receipt.openedReceipt.updatedReceipt.description,
      total: state.receipt.openedReceipt.updatedReceipt.total,
      transactionTime: state.receipt.openedReceipt.updatedReceipt.transactionTime,
      tags: tags,
      title: 'Edit Receipt'
    }
  },
  (dispatch) => {
    return {
      onSave: (receiptId, _, receiptData) => {
        dispatch(saveReceipt(
          receiptId,
          receiptData.total,
          receiptData.description,
          receiptData.transactionTime,
          receiptData.tags,
          (receipt) => {
            dispatch(openReceipt(receipt))
            dispatch(stopEditingReceipt())
            dispatch(navigateTo('RECEIPT_VIEW'))
          }
        ))
      },
      onModifiedReceipt: updatedFields => {
        dispatch(updateOpenedReceipt(updatedFields))
      },
      onClose: () => {
        dispatch(stopEditingReceipt())
        dispatch(navigateBack())
      },
      onDelete: (receiptId) => {
        dispatch(deleteReceipt(receiptId, () => {
          dispatch(navigateTo('RECEIPT_LIST'))
        }))
      },
      toReceipt: (receipt) => {
        dispatch(openReceipt(receipt))
        if (!needToEdit(receipt)) {
          dispatch(stopEditingReceipt())
          dispatch(navigateTo('RECEIPT_VIEW'))
        }
      },
      toImageViewer: () => {
        dispatch(navigateTo('RECEIPT_IMAGE'))
      }
    }
  }
)(ReceiptFormPage)

export const receiptCreatePageContainer = connect(
  (state: any) => {

    const existingTags = state.receipt.newReceipt.tags
    const tags = existingTags ? existingTags : []
    const existingTransactionTime = state.receipt.newReceipt.transactionTime
    const transactionTime = existingTransactionTime ? existingTransactionTime : new Date().getTime()

    return {
      image: state.receipt.newReceipt.image,
      thumbnail: state.receipt.newReceipt.thumbnail,
      isSwipable: false,
      isDeleting: false,
      description: state.receipt.newReceipt.description,
      total: state.receipt.newReceipt.total,
      transactionTime: transactionTime,
      tags: tags,
      title: 'New Receipt'
    }
  },
  (dispatch) => {
    return {
      onSave: (_, imageUri, receiptData) => {
        dispatch(createReceipt(imageUri,
          receiptData.total,
          receiptData.description,
          receiptData.transactionTime,
          receiptData.tags
        ))
        dispatch(navigateTo('RECEIPT_LIST'))
      },
      onModifiedReceipt: updatedFields => {
        dispatch(updateNewReceipt(updatedFields))
      },
      onClose: () => {
        dispatch(navigateTo('RECEIPT_LIST'))
      },
      toImageViewer: () => {
        dispatch(navigateTo('RECEIPT_IMAGE'))
      }
    }
  }
)(ReceiptFormPage)

export const imageViewerContainer = connect(
  (state: any) => {

    const isBeingEdited = state.receipt.openedReceipt.isBeingEdited

    return {
      source: state.receipt.openedReceiptImage.source,
      imageWidth: state.receipt.openedReceiptImage.width,
      imageHeight: state.receipt.openedReceiptImage.height,
      isBeingEdited: state.receipt.openedReceipt.isBeingEdited,
      total: isBeingEdited ? state.receipt.openedReceipt.updatedReceipt.total : undefined,
      transactionTime: isBeingEdited ? state.receipt.openedReceipt.updatedReceipt.transactionTime : undefined
    }
  },
  (dispatch) => {
    return {
      onClose: () => {
        dispatch(navigateBack())
      },
      onModifiedReceipt: updatedFields => {
        dispatch(updateOpenedReceipt(updatedFields))
      }
    }
  }
)(ImageViewer)

const routing = {
  RECEIPT_LIST: homePageContainer,
  RECEIPT_VIEW: receiptViewPageContainer,
  RECEIPT_CREATE: receiptCreatePageContainer,
  RECEIPT_EDIT: receiptEditPageContainer,
  RECEIPT_IMAGE: imageViewerContainer
}

export default routing
