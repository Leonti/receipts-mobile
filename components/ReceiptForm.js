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

var moment = require('moment');

class ReceiptForm extends React.Component {

    showDatePicker = async () => {
        try {
            const {action, year, month, day} = await DatePickerAndroid.open({
                date: this.props.transactionTime,
                maxDate: new Date(),
            });

            if (action !== DatePickerAndroid.dismissedAction) {
                const oldDate = new Date(this.props.transactionTime);

                const newTimestamp = new Date(year, month, day, oldDate.getHours(), oldDate.getMinutes()).getTime();
                this.props.onTransactionTimeChange(newTimestamp)
            }

        } catch ({code, message}) {
            console.warn(`Error displaying date picker`, message);
        }
    }

    showTimePicker = async () => {

        try {

            const oldDateTime = new Date(this.props.transactionTime);

            const {action, hour, minute} = await TimePickerAndroid.open({
                hour: oldDateTime.getHours(),
                minute: oldDateTime.getMinutes()
            });

            if (action !== TimePickerAndroid.dismissedAction) {
                const newTimestamp = new Date(
                    oldDateTime.getFullYear(),
                    oldDateTime.getMonth(),
                    oldDateTime.getDate(),
                    hour,
                    minute).getTime();
                this.props.onTransactionTimeChange(newTimestamp)
            }

        } catch ({code, message}) {
            console.warn(`Error displaying time picker`, message);
        }
    }

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
                <View style={styles.timeContainer}>
                    <TouchableWithoutFeedback
                        onPress={this.showDatePicker.bind(this)}
                    >
                        <View style={styles.timeTouchable}>
                            <Text style={styles.timeLabel}>{moment(this.props.transactionTime).format('ll')}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback
                        onPress={this.showTimePicker.bind(this)}
                    >
                        <View>
                            <Text style={styles.timeLabel}>{moment(this.props.transactionTime).format('LT')}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
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
};
export default ReceiptForm
