import React, { StatelessComponent } from 'react'
import {
  StyleSheet,
  View,
  Text
} from 'react-native'

import { Receipt } from '../services/Api'
import moment from 'moment'

function formatTotal(total: number): string {
  return total ? '$' + total : ''
}

type Props = {
  receipt: Receipt
}

const receiptDetails: StatelessComponent<Props> = (props) => (
  <View style={styles.container}>
    <Text style={styles.total}>{formatTotal(props.receipt.total)}</Text>
    <Text style={styles.description}>{props.receipt.description}</Text>
    <Text style={styles.transactionTime}>{moment(props.receipt.transactionTime).format('lll')}</Text>
  </View>
)

const styles = StyleSheet.create({
  container: {
    padding: 15
  },
  total: {
    fontSize: 40,
    fontWeight: 'bold'
  },
  description: {
    fontSize: 25
  },
  transactionTime: {
    fontSize: 25
  }
})

export default receiptDetails
