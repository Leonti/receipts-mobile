import React, {
    PropTypes,
    StyleSheet,
    View,
    ScrollView,
    ToastAndroid,
    Text } from 'react-native';

import ImageViewer from '../components/ImageViewer';
import ReceiptThumbnail from '../components/ReceiptThumbnail';
import ImagePlaceholder from '../components/ImagePlaceholder';
import ReceiptDetails from '../components/ReceiptDetails';

var Icon = require('react-native-vector-icons/Ionicons');
import Api from '../services/Api';

const MAX_HEIGHT = 200;

async function receiptToImage(receipt) {
    let file = receipt.files[0];

    return {
        source: {
            uri: (await Api.downloadReceiptFile(receipt.id, file.id, file.ext)),
            isStatic: true
        },
        width: file.metaData.width,
        height: file.metaData.height,
    };
}

function receiptToThumbnailDimensions(receipt) {
    let file = receipt.files[0];
    let scale = MAX_HEIGHT / file.metaData.height

    return {
        width: file.metaData.width * scale,
        height: file.metaData.height * scale,
    };
}

class ReceiptViewPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            receiptImage: null
        }
    }

    componentWillMount() {

        let self = this;
        receiptToImage(this.props.receipt).then(function(receiptImage) {
            self.setState({
                receiptImage: receiptImage
            });
        }, function(e) {
            console.error('Failed to download image', e);
            ToastAndroid.show('Failed to download receipt image', ToastAndroid.LONG);
        });
    }

    _openImageViewer() {
        this.props.toRoute({
            component: ImageViewer,
            passProps: {
                source: this.state.receiptImage.source,
                imageWidth: this.state.receiptImage.width,
                imageHeight: this.state.receiptImage.height,
            }
        });
    }

    _renderThumbnail() {
        let thumbnailDimensions = receiptToThumbnailDimensions(this.props.receipt);

        return (
            <ReceiptThumbnail
                onPress={() => this._openImageViewer()}
                source={this.state.receiptImage.source}
                width={thumbnailDimensions.width}
                height={thumbnailDimensions.height}
            />
        );
    }

    _renderPlaceholder() {
        let thumbnailDimensions = receiptToThumbnailDimensions(this.props.receipt);

        return (
            <ImagePlaceholder
                width={thumbnailDimensions.width}
                height={thumbnailDimensions.height}
            />
        );
    }

    render () {

        let thumbnail = this.state.receiptImage != null ?
            this._renderThumbnail() : this._renderPlaceholder();

    //    let thumbnail = this._renderPlaceholder();

        return (
            <View style={styles.container}>
                <Icon.ToolbarAndroid
                    style={styles.toolbar}
                    title="Receipt"
                    navIconName="android-close"
                    actions={[{title: 'Edit', show: 'always'}]}
                    onIconClicked={this.props.toBack}
                    onActionSelected={(position) => this._onActionSelected(position) } />
                {thumbnail}
                <ReceiptDetails receipt={this.props.receipt} />
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    toolbar: {
        backgroundColor: '#e9eaed',
        height: 56,
    },
});

ReceiptViewPage.propTypes = {
    onSave: PropTypes.func.isRequired,
    receipt: PropTypes.object.isRequired,
    toRoute: PropTypes.func.isRequired,
    toBack: PropTypes.func.isRequired,
};
export default ReceiptViewPage
