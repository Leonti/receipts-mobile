import React, {Component, PropTypes} from "react";
import {
    StyleSheet,
    View,
    Text,
    ToolbarAndroid,
    ScrollView,
    ToastAndroid } from 'react-native';

import Api from '../services/Api';
import LoginPage from './LoginPage';
import CredentialsForm from '../components/CredentialsForm';

var Icon = require('react-native-vector-icons/Ionicons');

const propTypes = {
  resetToRoute: PropTypes.func.isRequired
};

class SignupPage extends React.Component {

    constructor(props) {
        super(props);

        this._navigateToLogin = this._navigateToLogin.bind(this);
        this._navigateToLoginWithToast = this._navigateToLoginWithToast.bind(this);
    }

  _navigateToLoginWithToast() {
      ToastAndroid.show('User was created', ToastAndroid.LONG);
      this._resetToLogin();
  }

  _navigateToLogin() {
      this.props.resetToRoute({
        component: LoginPage
      });
  }

  render() {
    return (
        <View>
            <Icon.ToolbarAndroid
                navIconName="android-arrow-back"
                onIconClicked={this._navigateToLogin}
              style={styles.toolbar}
              title="Sign Up" />
          <ScrollView style={styles.form}>
            <CredentialsForm label={'Sign Up'} onSubmit={Api.createUser} onSuccess={this._navigateToLoginWithToast}/>
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

SignupPage.propTypes = propTypes;
export default SignupPage;
