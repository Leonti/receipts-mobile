import React, {
    PropTypes,
    StyleSheet,
    View,
    Text,
    ToastAndroid } from 'react-native';

import Api from '../services/Api';
import LoginPage from './LoginPage';
import CredentialsForm from '../components/CredentialsForm';

const propTypes = {
  resetToRoute: PropTypes.func.isRequired
};

class SignupPage extends React.Component {

    constructor(props) {
        super(props);

        this._navigateToLogin = this._navigateToLogin.bind(this);
    }

  _navigateToLogin() {
      ToastAndroid.show('User was created', ToastAndroid.LONG);
      this.props.resetToRoute({
        name: "Login",
        component: LoginPage
      });
  }

  render() {
    return (
        <View>
            <CredentialsForm label={'Sign Up'} onSubmit={Api.createUser} onSuccess={this._navigateToLogin}/>
        </View>
      );
  }

}

SignupPage.propTypes = propTypes;
export default SignupPage;
