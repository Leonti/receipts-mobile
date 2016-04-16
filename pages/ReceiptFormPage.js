import React, {
    PropTypes,
    StyleSheet,
    View,
    ProgressBarAndroid,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    Text } from 'react-native';

import ImageViewer from './ImageViewer';
import Spinner from './Spinner';
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

        this._imageViewer = this._imageViewer.bind(this);
        this._onActionSelected = this._onActionSelected.bind(this);
    }

    _imageViewer() {
        this.props.toRoute({
            component: ImageViewer,
            passProps: {
                source: this.props.source,
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

    render() {
        return (
            <View style={{
                flex: 1
            }}>
                <Icon.ToolbarAndroid
                    style={styles.toolbar}
                    title="New Receipt"
                    navIconName="android-close"
                    actions={[{title: 'Save', show: 'always'}]}
                    onIconClicked={this.props.toBack}
                    onActionSelected={this._onActionSelected} />
                <ScrollView>
                    <View style={{
                        alignItems: 'center'
                    }}>
                            <View style={{
                                padding: 15
                            }}>
                            <TouchableOpacity onPress={this._imageViewer}>
                                <Image
                                    source={this.props.source}
                                    style={{
                                        width: this.state.thumbnailWidth,
                                        height: this.state.thumbnailHeight,
                                    }} />
                            </TouchableOpacity>
                            </View>
                    </View>

                    <Text>Total:</Text>
                    <TextInput
                        keyboardType='numeric'
                        onChangeText={(text) => this.setState({total: text})}
                        value={this.state.total} />

                    <Text>Notes:</Text>
                    <TextInput style={{ height: 100, textAlignVertical: 'top'}}
                        onChangeText={(text) => this.setState({description: text})}
                        multiline={true}
                        value={this.state.description} />
                </ScrollView>
                <Spinner message='Saving receipt ...' visible={this.state.spinnerVisible} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    toolbar: {
        backgroundColor: '#e9eaed',
        height: 56,
    }
});

ReceiptFormPage.propTypes = {
    onSave: PropTypes.func.isRequired,
    source: PropTypes.object.isRequired,
    imageWidth: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
    toBack: PropTypes.func.isRequired,
};
export default ReceiptFormPage
