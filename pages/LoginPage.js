import React, {Component, PropTypes} from "react";
import {
    StyleSheet,
    View,
    TouchableHighlight,
    Text,
    ToolbarAndroid,
    ScrollView } from 'react-native';

import SignupPage from './SignupPage';
import HomePage from './HomePage';
import Api from '../services/Api';
import CredentialsForm from '../components/CredentialsForm';

const propTypes = {
  toRoute: PropTypes.func.isRequired,
  replaceRoute: PropTypes.func.isRequired
};

class LoginPage extends React.Component {

    constructor(props) {
        super(props);

        this._navigateHome = this._navigateHome.bind(this);
        this._onActionSelected = this._onActionSelected.bind(this);
    }

  _navigateHome() {
      this.props.replaceRoute({
        component: HomePage
      });
  }

  _onActionSelected(position) {
      this.props.toRoute({
        component: SignupPage
      });
  }

  render() {
      return (
          <View>
            <ToolbarAndroid
              style={styles.toolbar}
              title="Login"
              actions={[{title: 'Sign Up', show: 'always'}]}
              onActionSelected={this._onActionSelected} />
              <ScrollView style={styles.form}>
                <CredentialsForm label={'Login'} onSubmit={Api.login} onSuccess={this._navigateHome}/>
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

LoginPage.propTypes = propTypes;
export default LoginPage;
