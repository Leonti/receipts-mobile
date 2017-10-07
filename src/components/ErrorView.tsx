import React, { StatelessComponent } from 'react'
import {
  StyleSheet,
  View,
  Text
} from 'react-native'

export type Props = {
  message: string
}

const errorView: StatelessComponent<Props> = (props) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.message}>{props.message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
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
})

export default errorView
