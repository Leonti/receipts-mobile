import Api from './Api'
import ReceiptCache from '../services/ReceiptCache'
import ReceiptPending from '../services/ReceiptPending'
import Receipt from '../services/Receipt'
import TokenService from '../auth/TokenService'

const updateInList = (receipts, updatedReceipts) => receipts.map(r => {

  const updatedReceipt = updatedReceipts.find(ur => ur.id === r.id)
  if (updatedReceipt !== undefined) {
    return updatedReceipt
  }
  return r
})

function doneReceipts(allReceipts, pendingFiles) {
  const pendingReceiptsIds = pendingFiles.map(pendingFile => pendingFile.receiptId)
  return allReceipts.filter(receipt => !pendingReceiptsIds.includes(receipt.id))
}

function combinedWithoutDuplicates(cachedReceipts, serverReceipts) {
  const updatedCached = cachedReceipts.map(cachedReceipt => {
    const updatedReceipt = serverReceipts
      .find(serverReceipt => serverReceipt.id === cachedReceipt.id)
    return updatedReceipt || cachedReceipt
  })

  const onlyNewServer = serverReceipts
    .filter(receipt => !updatedCached
      .find(cachedReceipt => receipt.id === cachedReceipt.id))

  return updatedCached.concat(onlyNewServer)
}

class ReceiptSync {

  static async sendPending() {
    const pending = await ReceiptPending.getPending()
    const token = await TokenService.getAccessToken()
    const updated = await Promise.all(pending.map(async p => await Api.updateReceipt(token, p.id, p.delta)))
    const cached = await ReceiptCache.getCachedReceipts()
    const updatedCached = updateInList(cached, updated)

    return (await ReceiptCache.cacheReceipts(updatedCached))
  }

  static async _getUpdates() {
    const cachedReceipts = await ReceiptCache.getCachedReceipts()
    const lastModified = cachedReceipts.length > 0 ?
      cachedReceipts.sort((a, b) => b.lastModified - a.lastModified)[0].lastModified : 0

    console.log('last modified is', lastModified)

    const token = await TokenService.getAccessToken()
    const serverResult = await Api.getReceipts(token, lastModified)

    console.log('server result', serverResult)

    // just to force file download - should be done in a batch
    serverResult.receipts
      .filter(receipt => receipt.files.length > 0)
      .forEach(receipt => Receipt.receiptToImage(receipt))

    const combinedReceipts =
      doneReceipts(combinedWithoutDuplicates(cachedReceipts, serverResult.receipts),
        serverResult.pendingFiles)
        .sort((a, b) => b.transactionTime - a.transactionTime)

    await ReceiptCache.cacheReceipts(combinedReceipts)

    return {
      receipts: combinedReceipts,
      pendingFiles: serverResult.pendingFiles
    }
  }

  static async sync() {
    await ReceiptSync.sendPending()

    return (await ReceiptSync._getUpdates())
  }
}

export default ReceiptSync
