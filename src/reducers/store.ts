export namespace Store {

  export type Navigation = {
    page: string,
    history: string[]
  }

  type PendingFile = {

  }

  type ReceiptList = {
    pendingFiles: [PendingFile]
  }

  type Receipt = {
    receiptList: ReceiptList
  }

  export type All = {
    receipt: Receipt,
    navigation: Navigation
  }
}
