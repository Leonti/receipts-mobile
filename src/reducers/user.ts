import { combineReducers } from 'redux'
import { Action } from '../actions/user'
import { LoginState, UserState } from '../store'

function login(state: LoginState = {
  isFetching: false,
  isFetchingGoogle: false,
  user: undefined,
  error: undefined
}, action: Action) {
  switch (action.type) {
    case 'SET_LOGGED_IN_USER':
      return Object.assign({}, state, {
        user: action.user
      })
    case 'LOGIN_REQUEST':
      return Object.assign({}, state, {
        user: {},
        isFetching: true,
        error: undefined
      })
    case 'LOGIN_RESULT':
      console.log('Login success: ' + JSON.stringify(action))
      return Object.assign({}, state, {
        isFetching: false,
        user: action.result
      })
    case 'LOGIN_REQUEST_FAILURE':
      console.log('Login error: ' + action)
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      })
    case 'LOGOUT':
      return Object.assign({}, state, {
        user: {}
      })
    case 'LOGIN_CLEAR':
      return Object.assign({}, state, {
        user: {},
        isFetching: false,
        isFetchingGoogle: false,
        error: undefined
      })
    default:
      return state
  }
}

const rootReducer = combineReducers<UserState>({
  login
})

export default rootReducer
