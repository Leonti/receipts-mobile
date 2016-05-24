import React, {Component, PropTypes} from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    ToastAndroid,
    Alert,
    Text,
} from 'react-native';

import ReceiptFormPage from './ReceiptFormPage';
import ImageViewer from '../components/ImageViewer';
import ReceiptThumbnail from '../components/ReceiptThumbnail';
import ImagePlaceholder from '../components/ImagePlaceholder';
import ReceiptDetails from '../components/ReceiptDetails';
import Spinner from '../components/Spinner';
import Swiper from '../components/Swiper';

var Icon = require('react-native-vector-icons/MaterialIcons');
import Receipt from '../services/Receipt';

class ReceiptViewPage extends React.Component {

    constructor(props) {
        super(props);
/*
        this.state = {
        //    source: null,
        //    receipt: props.receipt,
            spinnerVisible: false,
        }
        */
    }
/*
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
*/
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
            this.props.onEdit();
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

        this.props.onDelete(this.props.receipt.id);
    }
/*
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
*/
    _renderThumbnail() {
    //    let thumbnailDimensions = Receipt.receiptToThumbnailDimensions(this.props.receipt);

        return (
            <ReceiptThumbnail
                onPress={() => this._openImageViewer()}
                source={this.props.image.source}
                width={this.props.thumbnail.width}
                height={this.props.thumbnail.height}
            />
        );
    }

    _renderPlaceholder() {
    //    let thumbnailDimensions = Receipt.receiptToThumbnailDimensions(this.props.receipt);

        return (
            <ImagePlaceholder
                width={this.props.thumbnail.width}
                height={this.props.thumbnail.height}
            />
        );
    }

    _onLeftSwipe() {
        if (this.props.nextReceipt) {
            this.props.toReceipt(this.props.nextReceipt);
        }
    }

    _onRightSwipe() {
        if (this.props.prevReceipt) {
            this.props.toReceipt(this.props.prevReceipt);
        }
    }

    render () {
        let thumbnail = this.props.image.source != null ?
            this._renderThumbnail() : this._renderPlaceholder();

        return (
            <Swiper
                onLeftSwipe={this._onLeftSwipe.bind(this)}
                onRightSwipe={this._onRightSwipe.bind(this)}>
                <View style={styles.container}>
                    <Icon.ToolbarAndroid
                        style={styles.toolbar}
                        title="Receipt"
                        navIconName="close"
                        actions={[
                            {title: 'Edit', show: 'always'},
                            {title: 'Delete', show: 'never'}]}
                        onIconClicked={this.props.onClose}
                        onActionSelected={(position) => this._onActionSelected(position) } />
                    {thumbnail}
                    <ReceiptDetails receipt={this.props.receipt} />
                    <Spinner message='Deleting receipt ...' visible={this.props.isDeleting} />
                </View>
            </Swiper>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    toolbar: {
        backgroundColor: '#e9eaed',
        height: 56,
    },
});

ReceiptViewPage.propTypes = {
    receipt: PropTypes.object.isRequired,
    nextReceipt: PropTypes.object,
    prevReceipt: PropTypes.object,
    image: PropTypes.object.isRequired,
    thumbnail: PropTypes.object.isRequired,
    error: PropTypes.string,
    onDelete: PropTypes.func.isRequired,
    isDeleting: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    toReceipt: PropTypes.func.isRequired,
    /*
    onSave: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    receipt: PropTypes.object.isRequired,
    onRightSwipe: PropTypes.func.isRequired,
    onLeftSwipe: PropTypes.func.isRequired,
    toRoute: PropTypes.func.isRequired,
    toBack: PropTypes.func.isRequired,
    */
};
export default ReceiptViewPage
