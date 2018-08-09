import TokenStorage from './TokenStorage'

import Auth0 from 'react-native-auth0'
import auth0Credentials from './auth0-credentials'
const auth0 = new Auth0(auth0Credentials)

export default class TokenService {

  static async isLoggedIn() {
    return !!(await TokenStorage.getRefreshToken())
  }

  static async login() {
    const credentials = await auth0.webAuth.authorize({
        scope: 'openid email offline_access',
        audience: 'receipts-backend'
      })

    console.log('Logged in successfully, saving tokens', credentials)
    await TokenStorage.setRefreshToken(credentials.refreshToken)
    await TokenStorage.setAccessToken(credentials.accessToken, credentials.expiresIn)
  }

  static async getAccessToken() {
    const accessToken = await TokenStorage.getAccessToken()

    if (accessToken) {
      console.log('Returning access token from cache')
      return accessToken
    }

    return TokenService._getAndSaveNewAccessToken()
  }

  static async _getAndSaveNewAccessToken() {
    const refreshToken = await TokenStorage.getRefreshToken()

    const credentials = await auth0.auth
      .refreshToken({refreshToken: refreshToken})
    console.log('refreshed acceddToken', credentials)
    await TokenStorage.setAccessToken(credentials.accessToken, credentials.expiresIn)

    return credentials.accessToken
  }

}
