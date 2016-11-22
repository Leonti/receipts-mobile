import React, {Component, PropTypes} from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Alert,
    Text } from 'react-native';

import ReceiptThumbnail from '../components/ReceiptThumbnail';
import ReceiptForm from '../components/ReceiptForm';
import Spinner from '../components/Spinner';
import ImagePlaceholder from '../components/ImagePlaceholder';
import Swiper from '../components/Swiper';
var Icon = require('react-native-vector-icons/MaterialIcons');

const MAX_HEIGHT = 200;

class ReceiptFormPage extends React.Component {

    constructor(props) {
        console.log(props)
        super(props);
        this.state = {
            description: props.description,
            total: props.total !== null && props.total !== undefined ? props.total.toString(): null,
            transactionTime: props.transactionTime ? props.transactionTime : new Date().getTime(),
            tags: props.tags ? props.tags : [],
        };
    }

    _onActionSelected(position) {
        if (position === 0) {
            this.props.onSave(this.props.receiptId, this.props.image.source.uri, {
                total: this.state.total,
                description: this.state.description,
                transactionTime: this.state.transactionTime,
                tags: this.state.tags,
            })
        } else if (position == 1) {
            Alert.alert('Delete Receipt',
            'Are you sure you want to delete this receipt?',
             [
                 {text: 'Cancel', onPress: () => console.log('Cancel Pressed!')},
                 {text: 'OK', onPress: () => this.props.onDelete(this.props.receiptId)},
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

    _renderForm() {
        let thumbnail = this.props.image.source != null ?
            this._renderThumbnail() : this._renderPlaceholder();

        return (
                <View>
                    <ScrollView>
                        {thumbnail}
                        <ReceiptForm
                            total={this.state.total}
                            onTotalChange={(text) => this.setState({total: text})}
                            description={this.state.description}
                            onDescriptionChange={(text) => this.setState({description: text})}
                            transactionTime={this.state.transactionTime}
                            onTransactionTimeChange={transactionTime => this.setState({transactionTime})}
                        />
                    </ScrollView>
                    <Spinner message='Saving receipt ...' visible={this.props.isFetching} />
                    <Spinner message='Deleting receipt ...' visible={this.props.isDeleting} />
                </View>
        );
    }

    render() {

        let form = this.props.isSwipable ?
            <Swiper
                onLeftSwipe={this._onLeftSwipe.bind(this)}
                onRightSwipe={this._onRightSwipe.bind(this)}>
                {this._renderForm()}
            </Swiper> :
            this._renderForm();

        return (
            <View style={styles.container}>
                <Icon.ToolbarAndroid
                    style={styles.toolbar}
                    title={this.props.title}
                    navIconName="close"
                    actions={[
                        {title: 'Save', show: 'always'},
                        {title: 'Delete', show: 'never'}
                    ]}
                    onIconClicked={this.props.onClose}
                    onActionSelected={(position) => this._onActionSelected(position) } />
                {form}
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

ReceiptFormPage.propTypes = {
    receiptId: PropTypes.string,
    isFetching: PropTypes.bool,
    nextReceipt: PropTypes.object,
    prevReceipt: PropTypes.object,
    isSwipable: PropTypes.bool.isRequired,
    image: PropTypes.object.isRequired,
    description: PropTypes.string.isRequired,
    total: PropTypes.any,
    transactionTime: PropTypes.number,
    tags: PropTypes.array,
    title: PropTypes.string.isRequired,

    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    toReceipt: PropTypes.func,
    toImageViewer: PropTypes.func.isRequired,
};
export default ReceiptFormPage
