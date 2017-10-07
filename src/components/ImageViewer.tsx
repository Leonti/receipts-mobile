import React, { StatelessComponent } from 'react'
import {
  Text,
  View,
  TextInput,
  TouchableHighlight,
  StyleSheet
} from 'react-native'

import ZoomableImage from './ZoomableImage'
import DateTimeSelector from './DateTimeSelector'
import Icon from 'react-native-vector-icons/MaterialIcons'

type Props = {
  source: object,
  imageWidth: number,
  imageHeight: number,
  isBeingEdited: boolean,
  total: number | string,
  transactionTime: number,

  onClose: () => void,
  onModifiedReceipt: (object) => void
}

const imageViewer: StatelessComponent<Props> = (props) => {

  const renderEditForm = () => {

    function formatTotal(total) {
      return total !== null && total !== undefined ? total.toString() : undefined
    }

    return (
      <View style={styles.editArea}>
        <View style={styles.form}>
          <Text style={styles.totalLabel}>$</Text>
          <TextInput style={styles.totalInput}
            keyboardType='numeric'
            value={formatTotal(props.total)}
            onChangeText={total => {
              props.onModifiedReceipt({ total })
            }}
          />
          <DateTimeSelector
            timestamp={props.transactionTime}
            onChange={transactionTime => {
              props.onModifiedReceipt({ transactionTime })
            }}
          />
        </View>
      </View>
    )
  }

  const editForm = props.isBeingEdited ? renderEditForm() : undefined

  return (
    <View style={{
      flex: 1,
      backgroundColor: 'black'
    }}>
      <ZoomableImage style={{
        flex: 1
      }}
        imageWidth={props.imageWidth}
        imageHeight={props.imageHeight}
        source={props.source}
      />
      {editForm}
      <TouchableHighlight onPress={props.onClose} style={styles.closeButton}>
        <Icon name='close' size={30} color='white' />
      </TouchableHighlight>
    </View>
  )
}

const styles = StyleSheet.create({

  closeButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 20
  },

  editArea: {
    backgroundColor: 'white'
  },

  form: {
    flexWrap: 'wrap',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 20,
    paddingLeft: 20
  },

  totalInput: {
    width: 100,
    fontSize: 25,
    padding: 5
  },

  totalLabel: {
    fontSize: 30
  }
})

export default imageViewer
