import React, {Component, PropTypes} from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
} from 'react-native';

const ReceiptThumbnail = (props) => (
    <View style={styles.container}>
        <TouchableOpacity onPress={props.onPress}>
            <Image
                source={props.source}
                style={{
                    width: props.width,
                    height: props.height,
                }} />
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 15,
    },
});

ReceiptThumbnail.propTypes = {
    onPress: PropTypes.func.isRequired,
    source: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
};
export default ReceiptThumbnail
