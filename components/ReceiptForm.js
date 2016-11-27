import React, {Component, PropTypes} from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    DatePickerAndroid,
    TimePickerAndroid,
} from 'react-native';

import DateTimeSelector from './DateTimeSelector';

class ReceiptForm extends React.Component {

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.formLabel}>Total:</Text>
                <TextInput
                    style={styles.total}
                    keyboardType='numeric'
                    onChangeText={(text) => this.props.onTotalChange(text)}
                    value={this.props.total} />

                <Text style={styles.formLabel}>Transaction time:</Text>
                <DateTimeSelector
                    timestamp={this.props.transactionTime}
                    onChange={this.props.onTransactionTimeChange}
                />
                <Text style={styles.formLabel}>Notes:</Text>
                <TextInput
                    style={styles.description}
                    onChangeText={(text) => this.props.onDescriptionChange(text)}
                    multiline={true}
                    value={this.props.description} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },

    formLabel: {
        fontSize: 18,
    },

    total: {
        fontSize: 18,
    },

    description: {
        fontSize: 18,
        height: 100,
        textAlignVertical: 'top',
    },

    timeContainer: {
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        flexDirection:'row',
        marginTop: 10,
        marginBottom: 10,
    },

    timeLabel: {
        fontSize: 18,
    },

    timeTouchable: {
        paddingRight: 25,
    }
});

ReceiptForm.propTypes = {
    total: PropTypes.string,
    onTotalChange: PropTypes.func.isRequired,
    description: PropTypes.string.isRequired,
    transactionTime: PropTypes.number.isRequired,
    onDescriptionChange: PropTypes.func.isRequired,
    onTransactionTimeChange: PropTypes.func.isRequired,
    onTagsChange: PropTypes.func.isRequired,
};
export default ReceiptForm
