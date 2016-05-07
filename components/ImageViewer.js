import React, {Component, PropTypes} from "react";
import {Text, View, TouchableHighlight, StyleSheet} from 'react-native';
import ZoomableImage from './ZoomableImage';
var Icon = require('react-native-vector-icons/Ionicons');

class ImageViewer extends Component {

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
                <TouchableHighlight onPress={this.props.toBack} style={styles.closeButton}>
                    <Icon name="android-close" size={30} color='white'/>
                </TouchableHighlight>
            </View>
        );
    }
}

const styles = StyleSheet.create({

    closeButton: {
        position: 'absolute',
        top: 0,
        left: 0,
        padding: 20
    }
});

ImageViewer.propTypes = {
    source: PropTypes.object.isRequired,
    imageWidth: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
};
export default ImageViewer;
