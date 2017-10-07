import Storage from './Storage'

const RECEIPT_PENDING_KEY = 'RECEIPT_PENDING_KEY'

class ReceiptPending {

  static async add(receiptId, delta) {
    const pending = await ReceiptPending.getPending()

    const withAdded = pending.concat({
      id: receiptId,
      delta: delta
    })
    return (await Storage.set(RECEIPT_PENDING_KEY, withAdded))
  }

  static async getPending() {
    return (await Storage.get(RECEIPT_PENDING_KEY) || [])
  }

  static async removePending(receiptId) {
    const pending = await ReceiptPending.getPending()

    const withoutRemoved = pending.filter(update => update.id !== receiptId)
    return (await Storage.set(RECEIPT_PENDING_KEY, withoutRemoved))
  }

}

export default ReceiptPending
