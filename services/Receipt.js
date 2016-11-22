import Api from './Api';
import ReceiptCache from '../services/ReceiptCache';

const MAX_HEIGHT = 200;

function doneReceipts(allReceipts, pendingFiles) {
    const pendingReceiptsIds = pendingFiles.map(pendingFile => pendingFile.receiptId);
    return allReceipts.filter(receipt => !pendingReceiptsIds.includes(receipt.id));
}

function combinedWithoutDuplicates(cachedReceipts, serverReceipts) {
    const updatedCached = cachedReceipts.map(cachedReceipt => {
        const updatedReceipt = serverReceipts
            .find(serverReceipt => serverReceipt.id === cachedReceipt.id)
        return updatedReceipt || cachedReceipt
    })

    const onlyNewServer = serverReceipts
        .filter(receipt => !updatedCached
                                .find(cachedReceipt => receipt.id === cachedReceipt.id));

    return updatedCached.concat(onlyNewServer);
}

class Receipt {

    static async receiptToImage(receipt) {
        let file = receipt.files.filter(file => file.parentId !== null)[0];

        return {
            source: {
                uri: (await Api.downloadReceiptFile(receipt.id, file.id, file.ext)),
                isStatic: true
            }
        };
    }

    static receiptToImageDimensions(receipt) {
        console.log('RECEIPT')
        console.log(receipt)
        let file = receipt.files.filter(file => file.parentId !== null)[0];

        return {
            width: file.metaData.width,
            height: file.metaData.height,
        };
    }

    static receiptToThumbnailDimensions(receipt) {
        let imageDimensions = Receipt.receiptToImageDimensions(receipt);
        let scale = MAX_HEIGHT / imageDimensions.height

        return {
            width: imageDimensions.width * scale,
            height: imageDimensions.height * scale,
        };
    }

    static imageToThumbnailDimensions(imageDimensions) {
        let scale = MAX_HEIGHT / imageDimensions.height

        return {
            width: imageDimensions.width * scale,
            height: imageDimensions.height * scale,
        };
    }

    static async combinedReceipts() {

        const cachedReceipts = await ReceiptCache.getCachedReceipts();
        const lastModified = cachedReceipts.length > 0 ?
            cachedReceipts.sort((a, b) => b.lastModified - a.lastModified)[0].lastModified : 0;

        console.log('last modified is', lastModified);

        const serverResult = await Api.getReceipts(lastModified);

        console.log('server result', serverResult);

        // just to force file download - should be done in a batch
        serverResult.receipts
            .filter(receipt => receipt.files.length > 0)
            .forEach(receipt => Receipt.receiptToImage(receipt));

        const combinedReceipts =
            doneReceipts(combinedWithoutDuplicates(cachedReceipts, serverResult.receipts),
                serverResult.pendingFiles)
            .sort((a, b) => b.transactionTime - a.transactionTime);

        await ReceiptCache.cacheReceipts(combinedReceipts);

        return {
            receipts: combinedReceipts,
            pendingFiles: serverResult.pendingFiles
        };
    }

    static cachedReceipts() {
        return ReceiptCache.getCachedReceipts();
    }
}

export default Receipt;
