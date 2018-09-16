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
    type: 'LOGIN_CLEAR'
  } | {
    type: 'LOGOUT'
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

    return TokenService.login().then(() => TokenService.getAccessToken()).then(Api.ensureUserExists).then(result => {
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

export const clearLogin = (): Action => ({
  type: 'LOGIN_CLEAR'
})

export const logout = (): Action => {
  TokenService.logout()
  return {
    type: 'LOGOUT'
  }
}
