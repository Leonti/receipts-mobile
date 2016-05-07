'use strict'
import React, {Component} from "react";
import Router from 'react-native-simple-router';
import { AppRegistry, StyleSheet } from 'react-native';

import Loader from './components/Loader';

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#2196f3',
    height: 0
  },
});

// TODO: consider https://github.com/aksonov/react-native-router-flux
const firstRoute = {
  name: 'Loader',
  component: Loader,
};

// The Router wrapper
class ReceiptsMobile extends Component {

  render() {
    return (
      <Router
        firstRoute={firstRoute}
        headerStyle={styles.header}
        handleBackAndroid={true}
        hideNavigationBar={true}
        noStatusBar={true}
      />
    );
  }
}

AppRegistry.registerComponent('ReceiptsMobile', () => ReceiptsMobile);
