import Api from '../services/Api'
import TokenService from '../auth/TokenService'

export type Action = {
  type: 'SET_LOGGED_IN_USER',
  user: any
} | {
    type: 'LOGIN_REQUEST'
  } | {
    type: 'LOGIN_RESULT',
    result: any
  } | {
    type: 'LOGIN_REQUEST_FAILURE',
    error: string
  } | {
    type: 'LOGIN_WITH_GOOGLE_REQUEST'
  } | {
    type: 'LOGIN_CLEAR'
  } | {
    type: 'LOGOUT'
  } | {
    type: 'CREATE_USER_REQUEST'
  } | {
    type: 'CREATE_USER_RESULT',
    result: any
  } | {
    type: 'CREATE_USER_REQUEST_FAILURE',
    error: string
  } | {
    type: 'CREATE_USER_CLEAR'
  }

export const setLoggedInUser = (user: any): Action => ({
  type: 'SET_LOGGED_IN_USER',
  user
})

/* LOGIN */
export const login = (postLoginAction: () => void) =>
  (dispatch: (_: Action) => void): Promise<void> => {

    dispatch({
      type: 'LOGIN_REQUEST'
    })

    return TokenService.login().then(result => {
      dispatch({
        type: 'LOGIN_RESULT',
        result
      })
      postLoginAction()
    }, error => {
      console.log('Error logging in:', error)
      dispatch({
        type: 'LOGIN_REQUEST_FAILURE',
        error: error.message
      })
    })
  }

export const loginWithGoogle = (idToken: string, postLoginAction: () => void) =>
  (dispatch: (_: Action) => void): Promise<void> => {

    dispatch({
      type: 'LOGIN_WITH_GOOGLE_REQUEST'
    })

    return Api.loginWithGoogle(idToken).then(Api.getUserInfo).then(result => {
      dispatch({
        type: 'LOGIN_RESULT',
        result
      })
      postLoginAction()
    }, error => {
      dispatch({
        type: 'LOGIN_REQUEST_FAILURE',
        error: error.message
      })
    })
  }

export const clearLogin = (): Action => ({
  type: 'LOGIN_CLEAR'
})

export const logout = (): Action => {
  Api.logout()
  return {
    type: 'LOGOUT'
  }
}

/* CREATE USER */
export const createUser = (username, password, postSignupAction) =>
  (dispatch: (_: Action) => any): Promise<void> => {
    dispatch({
      type: 'CREATE_USER_REQUEST'
    })

    return Api.createUser(username, password).then(result => {
      dispatch({
        type: 'CREATE_USER_RESULT',
        result
      })
      postSignupAction()
    }, error => {
      dispatch({
        type: 'CREATE_USER_REQUEST_FAILURE',
        error: error.message
      })
    })
  }

export const clearCreateUser = (): Action => ({
  type: 'CREATE_USER_CLEAR'
})
