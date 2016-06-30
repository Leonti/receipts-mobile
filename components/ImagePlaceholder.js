import React, {Component, PropTypes} from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator,
} from 'react-native';

const ImagePlaceholder = (props) => (
    <View style={styles.container}>
        <View style={{
            width: props.width,
            height: props.height,
            backgroundColor: '#ccc',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <ActivityIndicator size="large" />
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 15,
    },
});

ImagePlaceholder.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
};
export default ImagePlaceholder
