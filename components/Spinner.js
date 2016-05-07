import React from 'react';
import {
    PropTypes,
    View,
    ProgressBarAndroid,
    Text } from 'react-native';

var Spinner = (props) => {

    if (!props.visible) {
        return <View />;
    }

    return <View style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                right: 0,
                backgroundColor: 'white',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <ProgressBarAndroid styleAttr='Large'/>
                <Text style={{
                    fontSize: 22,
                }}>{props.message}</Text>
            </View>
};

Spinner.propTypes = {
    message: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
};

export default Spinner;
