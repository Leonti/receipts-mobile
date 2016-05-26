import React, {Component, PropTypes} from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
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
        super(props);
        this.state = {
            description: props.description,
            total: props.total !== null && props.total !== undefined ? props.total.toString(): null,
            spinnerVisible: false,
        };
    }

    _onActionSelected(position) {
        this.props.onSave(this.props.receiptId, this.props.image.source.uri, {
            total: this.state.total,
            description: this.state.description
        })
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
            <View style={styles.container}>
                <Icon.ToolbarAndroid
                    style={styles.toolbar}
                    title={this.props.title}
                    navIconName="close"
                    actions={[{title: 'Save', show: 'always'}]}
                    onIconClicked={this.props.onClose}
                    onActionSelected={(position) => this._onActionSelected(position) } />
                <ScrollView>
                    {thumbnail}
                    <ReceiptForm
                        total={this.state.total}
                        onTotalChange={(text) => this.setState({total: text})}
                        description={this.state.description}
                        onDescriptionChange={(text) => this.setState({description: text})}
                    />
                </ScrollView>
                <Spinner message='Saving receipt ...' visible={this.state.spinnerVisible} />
            </View>
        );
    }

    render() {

        if (!this.props.isSwipable) {
            return this._renderForm();
        }

        return (
            <Swiper
                onLeftSwipe={this._onLeftSwipe.bind(this)}
                onRightSwipe={this._onRightSwipe.bind(this)}>
                {this._renderForm()}
            </Swiper>
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

ReceiptFormPage.propTypes = {
    receiptId: PropTypes.string,
    nextReceipt: PropTypes.object,
    prevReceipt: PropTypes.object,
    isSwipable: PropTypes.bool.isRequired,
    image: PropTypes.object.isRequired,
    description: PropTypes.string.isRequired,
    total: PropTypes.number,
    title: PropTypes.string.isRequired,

    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    toReceipt: PropTypes.func,
    toImageViewer: PropTypes.func.isRequired,
};
export default ReceiptFormPage
