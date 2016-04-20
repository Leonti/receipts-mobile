import React, {
    PropTypes,
    StyleSheet,
    View,
    ScrollView,
    ToastAndroid,
    Text } from 'react-native';

import ImageViewer from '../components/ImageViewer';
import ReceiptThumbnail from '../components/ReceiptThumbnail';

var Icon = require('react-native-vector-icons/Ionicons');
import Api from '../services/Api';

const MAX_HEIGHT = 200;

function thumbnailDimensions(image) {
    let scale = MAX_HEIGHT / image.height

    return {
        width: image.width * scale,
        height: image.height * scale,
    };
}

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

    render () {

        let thumbnail = this.state.receiptImage != null ?
        (<ReceiptThumbnail
            onPress={() => this._openImageViewer()}
            source={this.state.receiptImage.source}
            width={thumbnailDimensions(this.state.receiptImage).width}
            height={thumbnailDimensions(this.state.receiptImage).height}
        />) :
        null;

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
