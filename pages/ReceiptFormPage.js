import React from 'react';
import {
    PropTypes,
    StyleSheet,
    View,
    ScrollView,
    Text } from 'react-native';

import ImageViewer from '../components/ImageViewer';
import ReceiptThumbnail from '../components/ReceiptThumbnail';
import ReceiptForm from '../components/ReceiptForm';
import Spinner from '../components/Spinner';
import ImagePlaceholder from '../components/ImagePlaceholder';
var Icon = require('react-native-vector-icons/Ionicons');

const MAX_HEIGHT = 200;

class ReceiptFormPage extends React.Component {

    constructor(props) {
        super(props);
        let scale = MAX_HEIGHT / props.imageHeight
        this.state = {
            description: props.description,
            total: props.total !== null ? props.total.toString(): null,
            thumbnailWidth: props.imageWidth * scale,
            thumbnailHeight: props.imageHeight * scale,
            spinnerVisible: false,
        };

        if (props.source instanceof Promise) {
            props.source.then((source) => {
                this.setState({source: source});
            }, () => console.log('Failed to resolve image promise in receipt form page'));
        } else {
            this.state.source = this.props.source;
        }
    }

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

    _onActionSelected(position) {
        this.setState({spinnerVisible: true});
        let hideSpinner = function() {
            this.setState({spinnerVisible: false});
        }.bind(this);

        this.props.onSave({
            total: this.state.total,
            description: this.state.description
        }).then(hideSpinner, hideSpinner);
    }

    _renderThumbnail() {
        console.log('rendering thumbnail', this.state.source);
        return (
            <ReceiptThumbnail
                onPress={() => this._imageViewer()}
                source={this.state.source}
                width={this.state.thumbnailWidth}
                height={this.state.thumbnailHeight}
            />
        );
    }

    _renderPlaceholder() {
        console.log('rendering placeholder');
        return (
            <ImagePlaceholder
                width={this.state.thumbnailWidth}
                height={this.state.thumbnailHeight}
            />
        );
    }

    render() {
        let thumbnail = this.state.source != null ?
            this._renderThumbnail() : this._renderPlaceholder();

        return (
            <View style={styles.container}>
                <Icon.ToolbarAndroid
                    style={styles.toolbar}
                    title={this.props.title}
                    navIconName="android-close"
                    actions={[{title: 'Save', show: 'always'}]}
                    onIconClicked={this.props.toBack}
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
    onSave: PropTypes.func.isRequired,
    source: PropTypes.object.isRequired,
    imageWidth: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    total: PropTypes.any.isRequired,
    title: PropTypes.string.isRequired,
    toRoute: PropTypes.func.isRequired,
    toBack: PropTypes.func.isRequired,
};
export default ReceiptFormPage
