import React, { StatelessComponent } from 'react'
import {
  StyleSheet,
  View,
  ScrollView
} from 'react-native'

import CredentialsForm from '../components/CredentialsForm'

import Icon from 'react-native-vector-icons/MaterialIcons'

type Props = {
  isFetching: boolean,
  error: string,

  toLogin: () => void,
  onSignup: () => void
}

const signupPage: StatelessComponent<Props> = (props) => {

  return (
    <View style={{
      flex: 1
    }}>
      <Icon.ToolbarAndroid
        navIconName='arrow-back'
        onIconClicked={props.toLogin}
        style={styles.toolbar}
        title='Sign Up' />
      <ScrollView style={styles.form}>
        <CredentialsForm label={'Sign Up'}
          onSubmit={props.onSignup}
          isFetching={props.isFetching}
          error={props.error}
        />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#e9eaed',
    height: 56
  },
  form: {
    flex: 1,
    padding: 20
  }
})

export default signupPage
