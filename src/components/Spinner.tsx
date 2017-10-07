import React, { StatelessComponent } from 'react'
import {
  View,
  ActivityIndicator,
  Text
} from 'react-native'

type Props = {
  message: string,
  visible: boolean
}

const spinner: StatelessComponent<Props> = (props) => {

  if (!props.visible) {
    return <View />
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
    alignItems: 'center'
  }}>
    <ActivityIndicator size='large' />
    <Text style={{
      fontSize: 22
    }}>{props.message}</Text>
  </View>
}

export default spinner
