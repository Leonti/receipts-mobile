import React, { PropTypes, StyleSheet, View, TouchableHighlight, Text } from 'react-native';

import SignupPage from './SignupPage';
import HomePage from './HomePage';
import Api from '../services/Api';
import CredentialsForm from '../components/CredentialsForm';

const propTypes = {
  toRoute: PropTypes.func.isRequired
};

class LoginPage extends React.Component {

    constructor(props) {
        super(props);

        this._navigateHome = this._navigateHome.bind(this);
        this.signupPage = this.signupPage.bind(this);
    }

  _navigateHome() {
      this.props.toRoute({
        name: "Home",
        component: HomePage
      });
  }

  signupPage() {
      this.props.toRoute({
        name: "Signup",
        component: SignupPage
      });
  }

  render() {
      return (
          <View>
            <CredentialsForm label={'Login'} onSubmit={Api.login} onSuccess={this._navigateHome}/>
            <TouchableHighlight onPress={this.signupPage} underlayColor="transparent">
              <Text>Signup!</Text>
            </TouchableHighlight>
          </View>
      );
  }

}

LoginPage.propTypes = propTypes;
export default LoginPage;
