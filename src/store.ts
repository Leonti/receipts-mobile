import { Receipt, PendingFile, UserInfo } from './services/Api'
import { Thumbnail, ReceiptImage } from './types'

export namespace Store {

  export type ReceiptListState = {
    receipts: Receipt[],
    pendingFiles: PendingFile[],
    isFetching: boolean,
    drawerOpened: boolean,
    error: string,
    isRefreshInterval: boolean
  }

  export type CreateReceiptState = {
    isFetching: boolean,
    uploadIds: string[],
    error: string
  }

  export type SaveReceiptState = {
    isFetching: boolean,
    savedReceipt: Receipt,
    error: string
  }

  export type DeleteReceiptState = {
    isFetching: boolean,
    deletionResult: boolean,
    isAskingConfirmation: boolean,
    confirmationResult: string,
    error: string
  }

  export type NewReceiptState = {
    image: ReceiptImage,
    thumbnail: Thumbnail,
    total: number,
    description: string,
    transactionTime: number,
    tags: string[]
  }

  export type OpenedReceiptState = {
    receipt: Receipt,
    updatedReceipt: Receipt,
    isBeingEdited: boolean,
    image: ReceiptImage,
    thumbnail: Thumbnail,
    error: string
  }

  export type OpenedReceiptImageState = ReceiptImage

  export type ReceiptState = {
    receiptList: ReceiptListState,
    createReceipt: CreateReceiptState,
    saveReceipt: SaveReceiptState,
    deleteReceipt: DeleteReceiptState,
    newReceipt: NewReceiptState,
    openedReceipt: OpenedReceiptState,
    openedReceiptImage: OpenedReceiptImageState
  }

  export type LoginState = {
    isFetching: boolean,
    isFetchingGoogle: boolean,
    user: UserInfo,
    error: string
  }

  export type SignupState = {
    isFetching: boolean,
    user: UserInfo,
    error: string
  }

  export type UserState = {
    login: LoginState,
    signup: SignupState
  }

  export type All = {
    receipt: ReceiptState,
    user: UserState
  }
}
