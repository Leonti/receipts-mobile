import Storage from './Storage'
import { NetworkFiles } from './NetworkFiles'
import { SubmitUploadResult, ReceiptsUploader } from './ReceiptsUploader'
import { DeviceEventEmitter } from 'react-native'

import { Buffer } from 'buffer/'

const baseUrl = () => (__DEV__ ? 'http://10.0.2.2:9000' : 'https://api.receipts.leonti.me')

const TOKEN_STORAGE_KEY = 'TOKEN'
const USER_INFO_KEY = 'USER_INFO'

export type ReceiptFileType = 'IMAGE'

export type ReceiptFileMetadata = {
  fileType: ReceiptFileType,
  length: number,
  width: number,
  height: number
}

export type ReceiptFile = {
  id: string,
  timestamp: number,
  ext: string,
  metaData: ReceiptFileMetadata,
  parentId?: string
}

export type Receipt = {
  id: string,
  userId: string,
  timestamp: number,
  lastModified: number,
  transactionTime: number,
  description: string,
  tags: string[],
  total?: number,
  files: ReceiptFile[]
}

export type PendingFile = {
  id: string,
  userId: string,
  receiptId: string
}

export type UserInfo = {
  id: string,
  userName: string
}

export type OkResponse = {
  message: string
}

export type ErrorResponse = {
  error: string
}

export type CreateUserRequest = {
  userName: string,
  password: string
}

export type OauthAccessToken = {
  token_type: string,
  access_token: string,
  expires_in: string
}

/*
{ timestamp: 1502005295581,
lastModified: 1502005316110,
description: '',
tags: [],
total: null,
files:
 [ { timestamp: 1502005308311,
     id: 'e6094cee-2a2c-409c-b505-a69472fb5c90',
     ext: 'jpg',
     metaData: { fileType: 'IMAGE', length: 1954317, width: 3024, height: 4032 },
     parentId: null },
   { timestamp: 1502005310176,
     id: 'e1e08a81-34f8-487c-8b57-622141a850cc',
     ext: 'jpg',
     metaData: { fileType: 'IMAGE', length: 197474, width: 866, height: 1154 },
     parentId: 'e6094cee-2a2c-409c-b505-a69472fb5c90' } ],
id: '2a9eefa1-6c90-4131-b934-0b89413d081f',
userId: 'dbafc797-15fb-4142-9e7b-9c3c21d5a0db',
transactionTime: 1502005277674 }
*/

class Api {

  public static _uploadCallbacks = []

  static async createUser(username: string, password: string): Promise<any> {
    let result = await (await fetch(baseUrl() + '/user/create', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userName: username,
        password: password
      })
    })).json()

    if (result.error) {
      throw new Error(result.error)
    }

    return result
  }

  static async login(username: string, password: string): Promise<any> {
    let result = await (await fetch(baseUrl() + '/token/create', {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64'),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })).json()

    if (!result.access_token) {
      throw new Error('Invalid credentials')
    }

    await Storage.set(TOKEN_STORAGE_KEY, result)
    let userInfo = await Api._fetchUserInfo(result)
    await Storage.set(USER_INFO_KEY, userInfo)
    return userInfo
  }

  static async loginWithGoogle(idToken: string): Promise<any> {
    let result = await (await fetch(baseUrl() + '/oauth/google-id-token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: idToken
      })
    })).json()

    if (!result.access_token) {
      throw new Error('Invalid credentials')
    }

    await Storage.set(TOKEN_STORAGE_KEY, result)
    let userInfo = await Api._fetchUserInfo(result)
    await Storage.set(USER_INFO_KEY, userInfo)
    return userInfo
  }

  static async getUserInfo(): Promise<string> {
    return await Storage.get(USER_INFO_KEY)
  }

  static async downloadReceiptFile(receiptId: string, fileId: string, fileExt: string): Promise<any> {
    let token = await Api._getAccessToken()
    let userId = await Api._getUserId()

    let result = await NetworkFiles.download({
      url: baseUrl() + '/user/' + userId + '/receipt/' + receiptId + '/file/' + fileId + '.' + fileExt,
      headers: { 'Authorization': 'Bearer ' + token },
      force: false
    })

    return 'file://' + result.file
  }

  static async uploadFile(
    fileUri: string,
    total: string,
    description: string,
    transactionTime: number,
    tags: string[]): Promise<SubmitUploadResult> {
    let token = await Api._getAccessToken()
    let userId = await Api._getUserId()

    return (await ReceiptsUploader.submit({
      token: token,
      uploadUrl: baseUrl() + '/user/' + userId + '/receipt',
      receipts: [
        {
          uri: fileUri,
          fields: {
            total: total === null ? '' : total,
            description: description === null ? '' : description,
            transactionTime: transactionTime.toString(),
            tags: tags.reduce((acc, tag) => acc + ',' + tag, '')
          }
        }
      ]
    }))
  }

  static async batchUpload(files: string[]): Promise<SubmitUploadResult> {
    console.log('BATCH UPLOADING', files)
    let token = await Api._getAccessToken()
    let userId = await Api._getUserId()

    return (await ReceiptsUploader.submit({
      token: token,
      uploadUrl: baseUrl() + '/user/' + userId + '/receipt',
      receipts: files.map(file => {
        return {
          uri: file,
          fields: {
            total: '',
            description: '',
            transactionTime: new Date().getTime().toString(),
            tags: ''
          }
        }
      })
    }))
  }

  static async updateReceipt(receiptId: string, fields: {
    description: string,
    total: string,
    tags: string,
    transactionTime: string
  }): Promise<any> {
    let token = await Api._getAccessToken()
    let userId = await Api._getUserId()

    return await (await fetch(baseUrl() + '/user/' + userId + '/receipt/' + receiptId, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        op: 'replace',
        path: '/description',
        value: fields.description
      },
      {
        op: 'replace',
        path: '/total',
        value: toTotalValue(fields.total)
      },
      {
        op: 'replace',
        path: '/tags',
        value: fields.tags
      },
      {
        op: 'replace',
        path: '/transactionTime',
        value: fields.transactionTime
      }
      ])
    })).json()
  }

  static async deleteReceipt(receiptId: string): Promise<any> {
    let token = await Api._getAccessToken()
    let userId = await Api._getUserId()

    return await fetch(baseUrl() + '/user/' + userId + '/receipt/' + receiptId, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
  }

  static async isLoggedIn(): Promise<boolean> {
    let token = await Storage.get(TOKEN_STORAGE_KEY)

    if (token) {
      return true
    }

    return false
  }

  static async logout(): Promise<void> {
    await Storage.remove(TOKEN_STORAGE_KEY)
    await Storage.remove(USER_INFO_KEY)
  }

  static async getReceipts(lastModified: number): Promise<any> {
    const token = await Api._getAccessToken()
    const userId = await Api._getUserId()

    const receipts = await (await fetch(
      baseUrl() + '/user/' + userId + '/receipt?last-modified=' + lastModified, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })).json()

    const pendingFiles = await (await fetch(baseUrl() + '/user/' + userId + '/pending-file', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })).json()

    return {
      receipts: receipts,
      pendingFiles: pendingFiles
    }
  }

  static onReceiptUploaded(callback) {

    console.log('Current callbacks size ' + Api._uploadCallbacks.length)

    Api._uploadCallbacks.push(callback)
  }

  private static async _fetchUserInfo(token) {
    return await (await fetch(baseUrl() + '/user/info', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token.access_token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })).json()
  }

  private static async _getAccessToken(): Promise<string> {
    return (await Storage.get(TOKEN_STORAGE_KEY)).access_token
  }

  private static async _getUserId(): Promise<string> {
    return (await Storage.get(USER_INFO_KEY)).id
  }
}

DeviceEventEmitter.addListener('receiptUploaded', function(event) {  // handle event.
  console.log('RECEIPT UPLOADED EVENT JS', event)
  Api._uploadCallbacks.forEach(callback => callback(event))

  /*
      ReceiptsUploader.currentUploads().then((uploads) => {
          console.log(uploads);
      }, (e) => console.log(e));
  */
})

function toTotalValue(total) {
  try {
    let result = parseFloat(total)
    if (isNaN(result)) {
      return undefined
    }

    return result
  } catch (e) {
    return undefined
  }
}

export default Api
