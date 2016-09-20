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

}

export default ReceiptCache;
