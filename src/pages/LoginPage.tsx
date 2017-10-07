import React, { StatelessComponent } from 'react'
import {
  StyleSheet,
  View,
  ToolbarAndroid,
  ScrollView
} from 'react-native'

import CredentialsForm from '../components/CredentialsForm'
import GoogleLogin from '../components/GoogleLogin'

export type LoginPageProps = {
  isFetching: boolean,
  isFetchingGoogle: boolean,
  error: string,

  toSignup: () => void,
  onLogin: () => void,
  onGoogleLogin: () => void
}

const loginPage: StatelessComponent<LoginPageProps> = (props) => {

  return (
    <View style={{
      flex: 1
    }}>
      <ToolbarAndroid
        style={styles.toolbar}
        title='Login'
        actions={[{ title: 'Sign Up', show: 'always' }]}
        onActionSelected={() => props.toSignup()} />
      <ScrollView style={styles.form}>
        <CredentialsForm label={'Login'}
          onSubmit={props.onLogin}
          isFetching={props.isFetching}
          error={props.error}
        />
        <GoogleLogin
          isFetching={props.isFetchingGoogle}
          onLogin={props.onGoogleLogin}
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

export default loginPage
