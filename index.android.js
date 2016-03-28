'use strict'

import Router from 'react-native-simple-router';
import React, { AppRegistry, StyleSheet } from 'react-native';

import Loader from './components/Loader';

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#5cafec',
  },
});

// TODO: consider https://github.com/aksonov/react-native-router-flux
const firstRoute = {
  name: 'Loader',
  component: Loader,
};

// The Router wrapper
class ReceiptsMobile extends React.Component {

  render() {
    return (
      <Router
        firstRoute={firstRoute}
        headerStyle={styles.header}
        handleBackAndroid={true}
      />
    );
  }
}

AppRegistry.registerComponent('ReceiptsMobile', () => ReceiptsMobile);
