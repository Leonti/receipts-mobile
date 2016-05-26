import React, {Component, PropTypes} from 'react';
import {
    StyleSheet,
    View,
    Text,
    ToolbarAndroid,
    ScrollView,
    ToastAndroid } from 'react-native';

import CredentialsForm from '../components/CredentialsForm';

var Icon = require('react-native-vector-icons/MaterialIcons');

class SignupPage extends React.Component {

    constructor(props) {
        super(props);
    }

  _navigateToLoginWithToast() {
      ToastAndroid.show('User was created', ToastAndroid.LONG);
      this.props.toLogin();
  }

  render() {
    return (
        <View style={{
            flex: 1,
        }}>
            <Icon.ToolbarAndroid
                navIconName="arrow-back"
                onIconClicked={this.props.toLogin}
              style={styles.toolbar}
              title="Sign Up" />
          <ScrollView style={styles.form}>
            <CredentialsForm label={'Sign Up'}
                onSubmit={this.props.onSignup}
                isFetching={this.props.isFetching}
                error={this.props.error}
            />
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

SignupPage.propTypes = {
  isFetching: PropTypes.bool,
  error: PropTypes.string,

  toLogin: PropTypes.func.isRequired,
  onSignup: PropTypes.func.isRequired,
};
export default SignupPage;
