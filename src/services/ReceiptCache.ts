import Storage from './Storage'

const RECEIPT_CACHE_KEY = 'RECEIPT_CACHE'

class ReceiptCache {

  static async cacheReceipts(receipts) {
    return (await Storage.set(RECEIPT_CACHE_KEY, receipts))
  }

  static async getCachedReceipts() {
    const cachedReceipts = await Storage.get(RECEIPT_CACHE_KEY)
    console.log('Cached receipts ' + JSON.stringify(cachedReceipts))
    return cachedReceipts || []
  }

  static async removeReceipt(receiptId) {
    const cachedReceipts = await ReceiptCache.getCachedReceipts()

    const updatedReceipts = cachedReceipts.filter(receipt => receipt.id !== receiptId)

    return (await ReceiptCache.cacheReceipts(updatedReceipts))
  }

}

export default ReceiptCache
