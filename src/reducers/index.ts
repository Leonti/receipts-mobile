import { combineReducers } from 'redux'

import navigation from './navigation'
import user from './user'
import receipt from './receipt'
import { Store } from './store'

export const reducers = combineReducers<Store.All>({
  navigation,
  user,
  receipt
})

export { Store } from './store'
