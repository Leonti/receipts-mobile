import React, { StatelessComponent } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TextInput
} from 'react-native'

import DateTimeSelector from './DateTimeSelector'

export type Props = {
  total: string,
  onTotalChange: (total: string) => void,
  description: string,
  transactionTime: number,
  tags: string[],
  onDescriptionChange: (description: string) => void,
  onTransactionTimeChange: (transactionTime: number) => void,
  onTagsChange: (tags: string[]) => void
}

const receiptForm: StatelessComponent<Props> = (props) => {

  return (
    <View style={styles.container}>
      <Text style={styles.formLabel}>Total:</Text>
      <TextInput
        style={styles.total}
        keyboardType='numeric'
        onChangeText={(text) => props.onTotalChange(text)}
        value={props.total} />

      <Text style={styles.formLabel}>Transaction time:</Text>
      <DateTimeSelector
        timestamp={props.transactionTime}
        onChange={props.onTransactionTimeChange}
      />
      <Text style={styles.formLabel}>Notes:</Text>
      <TextInput
        style={styles.description}
        onChangeText={(text) => props.onDescriptionChange(text)}
        multiline={true}
        value={props.description} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20
  },

  formLabel: {
    fontSize: 18
  },

  total: {
    fontSize: 18
  },

  description: {
    fontSize: 18,
    height: 100,
    textAlignVertical: 'top'
  }
})

export default receiptForm
