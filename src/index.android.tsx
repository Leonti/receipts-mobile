'use strict'
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { AppRegistry } from 'react-native'

import ReduxRouter from './router/ReduxRouter'

import thunkMiddleware from 'redux-thunk'
import * as redux from 'redux'
import { navigateTo } from './actions/navigation'
import { setLoggedInUser } from './actions/user'
import { loadReceipts, loadCachedReceipts } from './actions/receipt'

import Api from './services/Api'
import {
  Store,
  reducers
} from './reducers'

const store: redux.Store<Store.All> = redux.createStore(
  reducers,
  redux.compose(
    redux.applyMiddleware(thunkMiddleware)
  )
)

async function setup() {

  if ((await Api.isLoggedIn())) {
    let userInfo = await Api.getUserInfo()
    store.dispatch(setLoggedInUser(userInfo))
    store.dispatch(loadCachedReceipts())
    store.dispatch(navigateTo('RECEIPT_LIST'))
  } else {
    store.dispatch(navigateTo('LOGIN'))
  }

  Api.onReceiptUploaded(() => {
    store.dispatch(loadReceipts())
  })

  let timeoutId = undefined

  store.subscribe(() => {
    const storeState = store.getState()
    const pendingFiles = storeState.receipt.receiptList.pendingFiles

    if (pendingFiles.length > 0 && timeoutId === undefined) {
      console.log('refreshing receipts on timeout')
      timeoutId = setTimeout(() => {
        store.dispatch(loadReceipts())
        timeoutId = undefined
      }, 30 * 1000)
    } else {
      timeoutId = undefined
    }
  })
}

setup()

// The Router wrapper
class ReceiptsMobile extends Component {

  render() {
    return (
      <Provider store={store}>
        <ReduxRouter />
      </Provider>
    )
  }
}

AppRegistry.registerComponent('ReceiptsMobile', () => ReceiptsMobile)
