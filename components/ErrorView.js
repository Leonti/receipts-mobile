import React, {Component, PropTypes} from 'react';
import {
    StyleSheet,
    View,
    Text } from 'react-native';

const propTypes = {
    message: PropTypes.any.isRequired
};

class ErrorView extends Component {
    render() {
        return(
            <View style={styles.wrapper}>
                <Text style={styles.message}>{this.props.message}</Text>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    wrapper: {
        padding: 20,
        backgroundColor: '#f44336'
    },
    message: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center'
    }
});

ErrorView.propTypes = propTypes;
export default ErrorView
