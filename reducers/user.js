import { combineReducers } from 'redux'
import {
    SET_LOGGED_IN_USER,

    LOGIN_REQUEST,
    LOGIN_WITH_GOOGLE_REQUEST,
    LOGIN_RESULT,
    LOGIN_REQUEST_FAILURE,
    LOGIN_CLEAR,
    LOGOUT,

    CREATE_USER_REQUEST,
    CREATE_USER_RESULT,
    CREATE_USER_REQUEST_FAILURE,
    CREATE_USER_CLEAR,

} from '../actions/user'

function login(state = {
    isFetching: false,
    isFetchingGoogle: false,
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
        case LOGIN_WITH_GOOGLE_REQUEST:
            return Object.assign({}, state, {
                user: {},
                isFetchingGoogle: true,
                error: null,
            })
        case LOGIN_RESULT:
            return Object.assign({}, state, {
              isFetching: false,
              isFetchingGoogle: false,
              user: action.result,
            })
        case LOGIN_REQUEST_FAILURE:
            return Object.assign({}, state, {
              isFetching: false,
              isFetchingGoogle: false,
              error: action.error,
            })
        case LOGOUT:
            return Object.assign({}, state, {
              user: {},
            })
        case LOGIN_CLEAR:
            return Object.assign({}, state, {
              user: {},
              isFetching: false,
              isFetchingGoogle: false,
              error: null,
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
        case CREATE_USER_CLEAR:
            return Object.assign({}, state, {
              user: {},
              isFetching: false,
              error: null,
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
