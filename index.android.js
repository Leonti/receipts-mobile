'use strict'

import Router from 'react-native-simple-router';
import React, { AppRegistry, StyleSheet } from 'react-native';

import HomePage from './pages/HomePage';

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#5cafec',
  },
});

// Your route object should contain at least:
// - The name of the route (which will become the navigation bar title)
// - The component object for the page to render
const firstRoute = {
  name: 'Welcome!',
  component: HomePage,
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
