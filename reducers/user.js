import { combineReducers } from 'redux'
import {
    SET_LOGGED_IN_USER,

    LOGIN_REQUEST,
    LOGIN_RESULT,
    LOGIN_REQUEST_FAILURE,
    LOGOUT,

    CREATE_USER_REQUEST,
    CREATE_USER_RESULT,
    CREATE_USER_REQUEST_FAILURE,
} from '../actions/user'

function login(state = {
    isFetching: false,
    user: {},
    error: null,
}, action) {
    switch (action.type) {
        case SET_LOGGED_IN_USER:
            return Object.assign({}, state, {
                user: action.user,
            })
        case LOGIN_REQUEST:
            return Object.assign({}, state, {
                user: {},
                isFetching: true,
                error: null,
            })
        case LOGIN_RESULT:
            return Object.assign({}, state, {
              isFetching: false,
              user: action.result,
            })
        case LOGIN_REQUEST_FAILURE:
            return Object.assign({}, state, {
              isFetching: false,
              error: action.error,
            })
        case LOGOUT:
            return Object.assign({}, state, {
              user: {},
            })
        default:
            return state
    }
}

function createUser(state = {
    isFetching: false,
    user: {},
    error: null,
}, action) {
    switch (action.type) {
      case CREATE_USER_REQUEST:
        return Object.assign({}, state, {
            user: {},
            isFetching: true,
            error: null,
        })
      case CREATE_USER_RESULT:
        return Object.assign({}, state, {
          isFetching: false,
          user: action.result,
        })
      case CREATE_USER_REQUEST_FAILURE:
        return Object.assign({}, state, {
          isFetching: false,
          error: action.error,
        })
      default:
        return state
    }
}

const rootReducer = combineReducers({
  login,
  signup: createUser,
})

export default rootReducer
