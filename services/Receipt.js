import Api from './Api';

const MAX_HEIGHT = 200;

class Receipt {

    static async receiptToImage(receipt) {
        let file = receipt.files[0];

        return {
            source: {
                uri: (await Api.downloadReceiptFile(receipt.id, file.id, file.ext)),
                isStatic: true
            }
        };
    }

    static receiptToImageDimensions(receipt) {
        let file = receipt.files[0];

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
}

export default Receipt;
