import React, {Component, PropTypes} from 'react';
import {
    StyleSheet,
    View,
    TouchableHighlight,
    Text,
    ToolbarAndroid,
    ScrollView } from 'react-native';

import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin';

import CredentialsForm from '../components/CredentialsForm';

class LoginPage extends React.Component {

    constructor(props) {
        super(props);
    }

  _onActionSelected(position) {
      this.props.toSignup();
  }

  _signIn(user) {
console.log('Signing in');
      GoogleSignin.hasPlayServices({ autoResolve: true }).then(() => {

          console.log('Play services available!');
          // play services are available. can now configure library
          GoogleSignin.configure({
            scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
            webClientId: '9856662561-r9mlfauvsevltvkonm88lmsoii4ope45.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
            offlineAccess: true // if you want to access Google API on behalf of the user FROM YOUR SERVER
          })
          .then(() => {
            // you can now call currentUserAsync()

            GoogleSignin.signIn()
            .then((user) => {
              console.log(user);
              this.setState({user: user});
            })
            .catch((err) => {
              console.log('WRONG SIGNIN', err);
            })
            .done();

          });
      })
      .catch((err) => {
        console.log("Play services error", err.code, err.message);
      })



  }

  render() {
      return (
          <View>
            <ToolbarAndroid
              style={styles.toolbar}
              title="Login"
              actions={[{title: 'Sign Up', show: 'always'}]}
              onActionSelected={this._onActionSelected.bind(this)} />
              <ScrollView style={styles.form}>
                <CredentialsForm label={'Login'}
                    onSubmit={this.props.onLogin}
                    isFetching={this.props.isFetching}
                    error={this.props.error}
                />
                <GoogleSigninButton
    style={{width: 230, height: 48}}
    size={GoogleSigninButton.Size.Standard}
    color={GoogleSigninButton.Color.Dark}
    onPress={this._signIn.bind(this)}/>
              </ScrollView>
          </View>
      );
  }

}

const styles = StyleSheet.create({
    toolbar: {
        backgroundColor: '#e9eaed',
        height: 56,
    },
    form: {
        flex: 1,
        padding: 20,
    }
});

LoginPage.propTypes = {
  isFetching: PropTypes.bool,
  error: PropTypes.string,

  toSignup: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
};

export default LoginPage;
