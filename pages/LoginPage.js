import React, {Component, PropTypes} from 'react';
import {
    StyleSheet,
    View,
    TouchableHighlight,
    Text,
    ToolbarAndroid,
    ScrollView } from 'react-native';

import CredentialsForm from '../components/CredentialsForm';
import GoogleLogin from '../components/GoogleLogin';

class LoginPage extends React.Component {

    constructor(props) {
        super(props);
    }

  _onActionSelected(position) {
      this.props.toSignup();
  }

  render() {
      return (
          <View style={{
              flex: 1,
          }}>
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
                <GoogleLogin
                    isFetching={this.props.isFetchingGoogle}
                    onLogin={this.props.onGoogleLogin}
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

LoginPage.propTypes = {
  isFetching: PropTypes.bool,
  isFetchingGoogle: PropTypes.bool,
  error: PropTypes.string,

  toSignup: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  onGoogleLogin: PropTypes.func.isRequired,
};

export default LoginPage;
