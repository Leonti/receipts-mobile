import React, {Component, PropTypes} from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableWithoutFeedback,
    DatePickerAndroid,
    TimePickerAndroid,
} from 'react-native';

var moment = require('moment');

class DateTimeSelector extends React.Component {

    showDatePicker = async (timestamp) => {
        try {
            const {action, year, month, day} = await DatePickerAndroid.open({
                date: timestamp,
                maxDate: new Date(),
            });

            if (action !== DatePickerAndroid.dismissedAction) {
                const oldDate = new Date(timestamp);

                const newTimestamp = new Date(year, month, day, oldDate.getHours(), oldDate.getMinutes()).getTime();
                this.props.onChange(newTimestamp)
            }

        } catch ({code, message}) {
            console.warn(`Error displaying date picker`, message);
        }
    }

    showTimePicker = async (timestamp) => {

        try {

            const oldDateTime = new Date(timestamp);

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
                this.props.onChange(newTimestamp)
            }

        } catch ({code, message}) {
            console.warn(`Error displaying time picker`, message);
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback
                    onPress={() => this.showDatePicker(this.props.timestamp)}
                >
                    <View style={styles.timeTouchable}>
                        <Text style={styles.timeLabel}>{moment(this.props.timestamp).format('ll')}</Text>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback
                    onPress={() => this.showTimePicker(this.props.timestamp)}
                >
                    <View>
                        <Text style={styles.timeLabel}>{moment(this.props.timestamp).format('LT')}</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    }
}

const styles = StyleSheet.create({

    container: {
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

DateTimeSelector.propTypes = {
    timestamp: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
};
export default DateTimeSelector
