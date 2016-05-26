import React, {Component, PropTypes} from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Text } from 'react-native';

import ImageViewer from '../components/ImageViewer';
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
    //    let scale = MAX_HEIGHT / props.imageHeight
        this.state = {
            description: props.description,
            total: props.total !== null && props.total !== undefined ? props.total.toString(): null,
        //    thumbnailWidth: props.imageWidth * scale,
        //    thumbnailHeight: props.imageHeight * scale,
            spinnerVisible: false,
        };

/*
        if (props.source instanceof Promise) {
            props.source.then((source) => {
                this.setState({source: source});
            }, () => console.log('Failed to resolve image promise in receipt form page'));
        } else {
            this.state.source = this.props.source;
        }
        */
    }

/*
    _imageViewer() {
        this.props.toRoute({
            component: ImageViewer,
            passProps: {
                source: this.state.source,
                imageWidth: this.props.imageWidth,
                imageHeight: this.props.imageHeight
            }
        });
    }
    */

    _onActionSelected(position) {
/*
        if (!this.props.noSpinner) {
            this.setState({spinnerVisible: true});
        }

        let hideSpinner = function() {
            this.setState({spinnerVisible: false});
        }.bind(this);
*/
        this.props.onSave(this.props.receiptId, this.props.image.source.uri, {
            total: this.state.total,
            description: this.state.description
        })//.then(hideSpinner, hideSpinner);
    }

    _renderThumbnail() {
        //console.log('rendering thumbnail', this.state.source);
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
    //    console.log('rendering placeholder');
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
    onSave: PropTypes.func.isRequired,
    nextReceipt: PropTypes.object,
    prevReceipt: PropTypes.object,
    isSwipable: PropTypes.bool.isRequired,
//    source: PropTypes.object.isRequired,
//    imageWidth: PropTypes.number.isRequired,
//    imageHeight: PropTypes.number.isRequired,
    image: PropTypes.object.isRequired,
    description: PropTypes.string.isRequired,
//    noSpinner: PropTypes.bool,
    total: PropTypes.number,
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    toReceipt: PropTypes.func,
    toImageViewer: PropTypes.func.isRequired,
//    toRoute: PropTypes.func.isRequired,
//    toBack: PropTypes.func.isRequired,
};
export default ReceiptFormPage
