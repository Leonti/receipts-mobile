import { combineReducers } from 'redux'

import navigation from './navigation'
import user from './user'
import receipt from './receipt'
import { All } from './store'

export const reducers = combineReducers<All>({
  navigation,
  user,
  receipt
})
