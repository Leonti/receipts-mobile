import React, {Text, View, PropTypes} from 'react-native';
import ZoomableImage from './ZoomableImage';

const propTypes = {
  source: PropTypes.object.isRequired,
  imageWidth: PropTypes.number.isRequired,
  imageHeight: PropTypes.number.isRequired,
};

class ImageViewer extends React.Component {

    render() {
        return (
            <View style={{
                flex: 1
            }}>
                <ZoomableImage style={{
                    flex: 1
                  }}
                  imageWidth={this.props.imageWidth}
                  imageHeight={this.props.imageHeight}
                  source={this.props.source}
                />
            </View>
        );
    }
}

ImageViewer.propTypes = propTypes;
export default ImageViewer;
