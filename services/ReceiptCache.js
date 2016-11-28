import Storage from './Storage';

const RECEIPT_CACHE_KEY = 'RECEIPT_CACHE'

class ReceiptCache {

    static async cacheReceipts(receipts) {
        return (await Storage.set(RECEIPT_CACHE_KEY, receipts));
    }

    static async getCachedReceipts() {
        const cachedReceipts = await Storage.get(RECEIPT_CACHE_KEY);

        return cachedReceipts || [];
    }

    static async updateCachedReceipt(receipt) {
        const cachedReceipts = await ReceiptCache.getCachedReceipts();

        const updatedReceipts = cachedReceipts.map(r => {
            if (r.id == receipt.id) {
                return receipt;
            }
            return r;
        });

        return (await ReceiptCache.cacheReceipts(updatedReceipts));
    }

}

export default ReceiptCache;
