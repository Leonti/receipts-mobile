import { AsyncStorage } from 'react-native'

const REFRESH_TOKEN_KEY = '@TokenStorage:refresh_token'
const ACCESS_TOKEN_KEY = '@TokenStorage:access_token'
const ACCESS_TOKEN_EXPIRY_TIME_KEY = '@TokenStorage:access_token_expiry'

export default class TokenStorage {

  static async getRefreshToken() {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY)
  }

  static async setRefreshToken(refreshToken) {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }

  static async getAccessToken() {
    const expiryTime = await AsyncStorage.getItem(ACCESS_TOKEN_EXPIRY_TIME_KEY)
    if (expiryTime && JSON.parse(expiryTime) > new Date().getTime() + 300) {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY)
    }

    return null
  }

  static async setAccessToken(accessToken, expiresIn) {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    const expiryTime = new Date().getTime()
    await AsyncStorage.setItem(ACCESS_TOKEN_EXPIRY_TIME_KEY, JSON.stringify(expiryTime + expiresIn))
  }

  static async removeTokens() {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY)
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY)
    await AsyncStorage.removeItem(ACCESS_TOKEN_EXPIRY_TIME_KEY)
  }

}
