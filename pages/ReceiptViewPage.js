import React, {
    PropTypes,
    StyleSheet,
    View,
    ScrollView,
    ToastAndroid,
    Alert,
    Text } from 'react-native';

import ReceiptFormPage from './ReceiptFormPage';
import ImageViewer from '../components/ImageViewer';
import ReceiptThumbnail from '../components/ReceiptThumbnail';
import ImagePlaceholder from '../components/ImagePlaceholder';
import ReceiptDetails from '../components/ReceiptDetails';
import Spinner from '../components/Spinner';

var Icon = require('react-native-vector-icons/Ionicons');
import Receipt from '../services/Receipt';

class ReceiptViewPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            source: null,
            receipt: props.receipt,
            spinnerVisible: false,
        }
    }

    componentWillMount() {

        let imageSourcePromise = Receipt.receiptToImage(this.props.receipt)
            .then((receiptImage) => receiptImage.source);

        imageSourcePromise.then((source) => {
            this.setState({source: source});
        }, (e) => {
            console.error('Failed to download image', e);
            ToastAndroid.show('Failed to download receipt image', ToastAndroid.LONG);
        });

        this.imageSourcePromise = imageSourcePromise;
    }

    _openImageViewer() {
        let imageDimensions = Receipt.receiptToImageDimensions(this.props.receipt);

        this.props.toRoute({
            component: ImageViewer,
            passProps: {
                source: this.state.source,
                imageWidth: imageDimensions.width,
                imageHeight: imageDimensions.height,
            }
        });
    }

    _onActionSelected(position) {
        if (position === 0) {
            this._openEditView();
        } else if (position == 1) {
            Alert.alert('Delete Receipt',
            'Are you sure you want to delete this receipt?',
             [
                 {text: 'Cancel', onPress: () => console.log('Cancel Pressed!')},
                 {text: 'OK', onPress: () => this._onDeleteReceipt()},
             ]);
        }
    }

    _onDeleteReceipt() {
        this.setState({spinnerVisible: true});
        let hideSpinner = function() {
            this.setState({spinnerVisible: false});
        }.bind(this);

        this.props.onDelete().then(hideSpinner, hideSpinner);
    }

    _openEditView() {
        let imageDimensions = Receipt.receiptToImageDimensions(this.props.receipt);

        let source = this.state.source !== null ? this.state.source
            : this.imageSourcePromise;

        this.props.toRoute({
            component: ReceiptFormPage,
            passProps: {
                onSave: (fields) => {
                    let receipt = this.state.receipt;
                    receipt.total = fields.total;
                    receipt.description = fields.description;

                    this.setState({receipt: receipt});

                    return this.props.onSave(fields);
                },
                source: source,
                imageWidth: imageDimensions.width,
                imageHeight: imageDimensions.height,
                description: this.props.receipt.description,
                total: this.props.receipt.total === undefined ? '' : this.props.receipt.total,
                title: 'Edit Receipt',
            }
        });
    }

    _renderThumbnail() {
        let thumbnailDimensions = Receipt.receiptToThumbnailDimensions(this.props.receipt);

        return (
            <ReceiptThumbnail
                onPress={() => this._openImageViewer()}
                source={this.state.source}
                width={thumbnailDimensions.width}
                height={thumbnailDimensions.height}
            />
        );
    }

    _renderPlaceholder() {
        let thumbnailDimensions = Receipt.receiptToThumbnailDimensions(this.props.receipt);

        return (
            <ImagePlaceholder
                width={thumbnailDimensions.width}
                height={thumbnailDimensions.height}
            />
        );
    }

    render () {
        let thumbnail = this.state.source != null ?
            this._renderThumbnail() : this._renderPlaceholder();

        return (
            <View style={styles.container}>
                <Icon.ToolbarAndroid
                    style={styles.toolbar}
                    title="Receipt"
                    navIconName="android-close"
                    actions={[
                        {title: 'Edit', show: 'always'},
                        {title: 'Delete', show: 'never'}]}
                    onIconClicked={this.props.toBack}
                    onActionSelected={(position) => this._onActionSelected(position) } />
                {thumbnail}
                <ReceiptDetails receipt={this.state.receipt} />
                <Spinner message='Deleting receipt ...' visible={this.state.spinnerVisible} />
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
    onDelete: PropTypes.func.isRequired,
    receipt: PropTypes.object.isRequired,
    toRoute: PropTypes.func.isRequired,
    toBack: PropTypes.func.isRequired,
};
export default ReceiptViewPage
