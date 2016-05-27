import React, {Component, PropTypes} from 'react';
import {
  StyleSheet,
  Navigator,
  View,
  Platform,
  Text,
  StatusBar,
  TouchableHighlight
} from 'react-native';

import { connect } from 'react-redux';

import Routing from './PageContainers';

class ReduxRouter extends Component {

    constructor(props) {
        super(props);
        this.renderScene = this.renderScene.bind(this);
    }

    renderScene(route, navigator) {
        const PageToRender = Routing[this.props.navigation.page];

        if (PageToRender) {
            return (
                <PageToRender />
            );
        } else {
            return (
                <View>
                </View>
            );
        }
    }
// '#2196f3'
    render() {
        return (
          <View style={{ flex: 1 }}>
          <StatusBar backgroundColor='#2196f3' />
            <Navigator
              ref="navigator"
              initialRoute={{name: 'My First Scene', index: 0}}
              renderScene={this.renderScene}
            />
          </View>
        );
    }

}

const mapStateToProps = (state) => {
  return {
    navigation: state.navigation
  }
}

const ReduxRouterWrapped = connect(
  mapStateToProps
)(ReduxRouter)

export default ReduxRouterWrapped;
