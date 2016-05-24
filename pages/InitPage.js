import React, {Component, PropTypes} from 'react';
import { View, Navigator, TouchableHighlight } from 'react-native';

import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import Api from '../services/Api';

class InitPage extends Component {

    constructor(props) {
        super(props);

        this._setup();
    }

    async _setup() {

        let isLoggedInt = await Api.isLoggedIn();

        if ((await Api.isLoggedIn())) {

        } else {

        }
    }

    _login() {
        this.props.replaceRoute({
            component: LoginPage,
        });
    }

    _start() {
        this.props.replaceRoute({
          component: HomePage
        });
    }

    render() {
        return (
          <View>
          </View>
        );
    }

}

InitPage.propTypes =  {
  onLoggedIn: PropTypes.func.isRequired,
  onNotLoggedIn: PropTypes.func.isRequired,
};
export default InitPage;
