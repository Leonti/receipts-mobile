import React, { StatelessComponent } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  DatePickerAndroid,
  TimePickerAndroid
} from 'react-native'

import moment from 'moment'

export type Props = {
  timestamp: number,
  onChange: (timestamp: number) => void
}

const dateTimeSelector: StatelessComponent<Props> = (props) => {

  const showDatePicker = async (timestamp) => {
    try {
      const { action, year, month, day } = await DatePickerAndroid.open({
        date: timestamp,
        maxDate: new Date()
      })

      if (action !== DatePickerAndroid.dismissedAction) {
        const oldDate = new Date(timestamp)

        const newTimestamp = new Date(year, month, day, oldDate.getHours(), oldDate.getMinutes()).getTime()
        props.onChange(newTimestamp)
      }

    } catch ({ code, message }) {
      console.warn(`Error displaying date picker`, message)
    }
  }

  const showTimePicker = async (timestamp) => {

    try {

      const oldDateTime = new Date(timestamp)

      const { action, hour, minute } = await TimePickerAndroid.open({
        hour: oldDateTime.getHours(),
        minute: oldDateTime.getMinutes()
      })

      if (action !== TimePickerAndroid.dismissedAction) {
        const newTimestamp = new Date(
          oldDateTime.getFullYear(),
          oldDateTime.getMonth(),
          oldDateTime.getDate(),
          hour,
          minute).getTime()
        props.onChange(newTimestamp)
      }

    } catch ({ code, message }) {
      console.warn(`Error displaying time picker`, message)
    }
  }

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback
        onPress={() => showDatePicker(props.timestamp)}
      >
        <View style={styles.timeTouchable}>
          <Text style={styles.timeLabel}>{moment(props.timestamp).format('ll')}</Text>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback
        onPress={() => showTimePicker(props.timestamp)}
      >
        <View>
          <Text style={styles.timeLabel}>{moment(props.timestamp).format('LT')}</Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10
  },

  timeLabel: {
    fontSize: 18
  },

  timeTouchable: {
    paddingRight: 25
  }
})

export default dateTimeSelector
