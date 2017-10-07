import React, { StatelessComponent } from 'react'
import {
  StyleSheet,
  View,
  ActivityIndicator
} from 'react-native'

import { GoogleSigninButton } from 'react-native-google-signin'

export type Props = {
  isFetching: boolean,
  onLogin: () => void
}

const googleLogin: StatelessComponent<Props> = (props) => {

  let button = props.isFetching ? <ActivityIndicator size='large' /> :
    <GoogleSigninButton
      style={{ width: 230, height: 48 }}
      size={GoogleSigninButton.Size.Standard}
      color={GoogleSigninButton.Color.Dark}
      onPress={props.onLogin.bind(this)} />

  return (
    <View style={styles.container}>
      {button}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15
  }
})

export default googleLogin
