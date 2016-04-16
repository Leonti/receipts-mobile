import React, {Text, View, PropTypes, TouchableHighlight} from 'react-native';
import ZoomableImage from './ZoomableImage';
var Icon = require('react-native-vector-icons/Ionicons');

class ImageViewer extends React.Component {

    render() {
        return (
            <View style={{
                flex: 1,
                backgroundColor: 'black'
            }}>
                <ZoomableImage style={{
                    flex: 1
                  }}
                  imageWidth={this.props.imageWidth}
                  imageHeight={this.props.imageHeight}
                  source={this.props.source}
                />
                <TouchableHighlight onPress={this.props.toBack}
                    style={{
                        position: 'absolute',
                        top: 20,
                        left: 20
                    }}
                >
                <Icon name="android-close" size={30} color='white'

                />
                </TouchableHighlight>
            </View>
        );
    }
}

ImageViewer.propTypes = {
    source: PropTypes.object.isRequired,
    imageWidth: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
};
export default ImageViewer;
