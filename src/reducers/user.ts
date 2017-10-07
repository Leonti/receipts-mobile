import { combineReducers } from 'redux'
import { Action } from '../actions/user'
import { Store } from '../store'

function login(state: Store.LoginState = {
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
    case 'LOGIN_WITH_GOOGLE_REQUEST':
      return Object.assign({}, state, {
        user: {},
        isFetchingGoogle: true,
        error: undefined
      })
    case 'LOGIN_RESULT':
      return Object.assign({}, state, {
        isFetching: false,
        isFetchingGoogle: false,
        user: action.result
      })
    case 'LOGIN_REQUEST_FAILURE':
      return Object.assign({}, state, {
        isFetching: false,
        isFetchingGoogle: false,
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

function createUser(state: Store.SignupState = {
  isFetching: false,
  user: undefined,
  error: undefined
}, action: Action) {
  switch (action.type) {
    case 'CREATE_USER_REQUEST':
      return Object.assign({}, state, {
        user: {},
        isFetching: true,
        error: undefined
      })
    case 'CREATE_USER_RESULT':
      return Object.assign({}, state, {
        isFetching: false,
        user: action.result
      })
    case 'CREATE_USER_REQUEST_FAILURE':
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      })
    case 'CREATE_USER_CLEAR':
      return Object.assign({}, state, {
        user: {},
        isFetching: false,
        error: undefined
      })
    default:
      return state
  }
}

const rootReducer = combineReducers<Store.UserState>({
  login,
  signup: createUser
})

export default rootReducer
