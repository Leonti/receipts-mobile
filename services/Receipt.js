import Api from './Api';
import ReceiptCache from '../services/ReceiptCache';

const MAX_HEIGHT = 200;

class Receipt {

    static async receiptToImage(receipt) {
        let file = receipt.files.filter(file => file.parentId !== null)[0];

        if (!file) {
          return {
            source: {
              uri: "unknown",
              isStatic: true
            }
          }
        }

        return {
            source: {
                uri: (await Api.downloadReceiptFile(receipt.id, file.id, file.ext)),
                isStatic: true
            }
        };
    }

    static receiptToImageDimensions(receipt) {
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

    static updateReceipt(receipts, receiptId, delta) {
      return receipts.map(r => {
          if (r.id === receiptId) {
              return Object.assign({}, r, {
                  description: delta.description,
                  total: delta.total,
                  tags: delta.tags,
                  transactionTime: delta.transactionTime,
              });
          }
          return r;
      });
    }

    static cachedReceipts() {
        return ReceiptCache.getCachedReceipts();
    }
}

export default Receipt;
