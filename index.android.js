'use strict'
import React, {Component} from 'react';
import { Provider } from 'react-redux';
import { AppRegistry, StyleSheet } from 'react-native';

//import devTools from 'remote-redux-devtools';

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#2196f3',
    height: 0
  },
});

import ReduxRouter from './router/ReduxRouter';

import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { navigateTo } from './actions/navigation'
import { setLoggedInUser } from './actions/user'
import { loadReceipts, loadCachedReceipts } from './actions/receipt'
import navigationReducer from './reducers/navigation'
import userReducer from './reducers/user'
import receiptReducer from './reducers/receipt'

import Api from './services/Api';

const loggerMiddleware = createLogger()

const rootReducer = combineReducers({
  navigation: navigationReducer,
  user: userReducer,
  receipt: receiptReducer,
})

const store = createStore(
  rootReducer,
  compose(
      applyMiddleware(thunkMiddleware),
//      devTools(),
  )
)

//let unsubscribe = store.subscribe(() =>
//  console.log('CURRENT STORE STATE', store.getState())
//)

async function setup() {

    let isLoggedInt = await Api.isLoggedIn();

    if ((await Api.isLoggedIn())) {
        let userInfo = await Api.getUserInfo();
        store.dispatch(setLoggedInUser(userInfo));
        store.dispatch(loadCachedReceipts());
        store.dispatch(navigateTo('RECEIPT_LIST'));
    } else {
        store.dispatch(navigateTo('LOGIN'))
    }

    Api.onReceiptUploaded(() => {
//        store.dispatch(loadReceipts());
    });
}

setup();

// The Router wrapper
class ReceiptsMobile extends Component {

  render() {
    return (
        <Provider store={store}>
            <ReduxRouter/>
        </Provider>
    );
  }
}

AppRegistry.registerComponent('ReceiptsMobile', () => ReceiptsMobile);
