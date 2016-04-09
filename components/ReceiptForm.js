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

import { CloseButton } from './ModalButtons';
import ImageViewer from './ImageViewer';
import Spinner from './Spinner';
var Icon = require('react-native-vector-icons/Ionicons');

const MAX_HEIGHT = 200;

class ReceiptForm extends React.Component {

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

        this.props.bus.toggleSpinner = (visible) => {
            this.setState({spinnerVisible: visible});
        };

        this._imageViewer = this._imageViewer.bind(this);
    }

    _imageViewer() {
        this.props.toRoute({
            name: "View receipt",
            component: ImageViewer,
            leftCorner: CloseButton,
            leftCornerProps: {
                onClose: this.props.toBack
            },

            passProps: {
                source: this.props.source,
                imageWidth: this.props.imageWidth,
                imageHeight: this.props.imageHeight
            }
        });
    }

    componentWillUpdate(nextProps, nextState) {
        this.props.onUpdate({
            total: nextState.total,
            description: nextState.description,
        });
    }

    render() {
        return (
            <View style={{
                flex: 1
            }}>
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

ReceiptForm.propTypes = {
    onUpdate: PropTypes.func.isRequired,
    source: PropTypes.object.isRequired,
    imageWidth: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
    toBack: PropTypes.func.isRequired,
    bus: PropTypes.object.isRequired,
};
export default ReceiptForm
