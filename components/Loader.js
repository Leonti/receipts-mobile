import React, { PropTypes, View, Navigator } from 'react-native';

import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import Api from '../services/Api';

const propTypes = {
  toRoute: PropTypes.func.isRequired,
  replaceRoute: PropTypes.func.isRequired,
};

class Loader extends React.Component {

    constructor(props) {
        super(props);

        this._setup();
    }

    async _setup() {
        if (!(await Api.isLoggedIn())) {
            this._login();
        } else {
            this._start();
        }
    }

    _login() {
        this.props.replaceRoute({
            name: "Login",
            component: LoginPage
        });
    }

    _start() {
        this.props.replaceRoute({
          name: 'Welcome!',
          component: HomePage,
        });
    }

    render() {
        return (
          <View>
          </View>
        );
    }

}

Loader.propTypes = propTypes;
export default Loader;
