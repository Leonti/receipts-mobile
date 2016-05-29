import React, {Component, PropTypes} from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    ToastAndroid,
    Alert,
    Text,
} from 'react-native';

import ReceiptThumbnail from '../components/ReceiptThumbnail';
import ImagePlaceholder from '../components/ImagePlaceholder';
import ReceiptDetails from '../components/ReceiptDetails';
import Spinner from '../components/Spinner';
import Swiper from '../components/Swiper';

var Icon = require('react-native-vector-icons/MaterialIcons');

class ReceiptViewPage extends React.Component {

    constructor(props) {
        super(props);
    }

    _onActionSelected(position) {
        if (position === 0) {
            this.props.onEdit();
        } else if (position == 1) {
            Alert.alert('Delete Receipt',
            'Are you sure you want to delete this receipt?',
             [
                 {text: 'Cancel', onPress: () => console.log('Cancel Pressed!')},
                 {text: 'OK', onPress: () => this.props.onDelete(this.props.receipt.id)},
             ]);
        }
    }

    _renderThumbnail() {
        return (
            <ReceiptThumbnail
                onPress={this.props.toImageViewer}
                source={this.props.image.source}
                width={this.props.thumbnail.width}
                height={this.props.thumbnail.height}
            />
        );
    }

    _renderPlaceholder() {
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
                    <Swiper
                        onLeftSwipe={this._onLeftSwipe.bind(this)}
                        onRightSwipe={this._onRightSwipe.bind(this)}>
                        {thumbnail}
                        <ReceiptDetails receipt={this.props.receipt} />
                        <Spinner message='Deleting receipt ...' visible={this.props.isDeleting} />
                    </Swiper>
                </View>

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
    isDeleting: PropTypes.bool,

    onDelete: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    toReceipt: PropTypes.func.isRequired,
    toImageViewer: PropTypes.func.isRequired,
};
export default ReceiptViewPage
