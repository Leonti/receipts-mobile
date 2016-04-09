import Storage from './Storage';
var Buffer = require('buffer/').Buffer

const baseUrl = 'http://10.0.2.2:9000';
//const baseUrl = 'https://api.receipts.leonti.me';

const TOKEN_STORAGE_KEY = 'TOKEN'
const USER_INFO_KEY = 'USER_INFO'

class Api {

    static async createUser(username, password) {
        let result = await (await fetch(baseUrl + '/user/create', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userName: username,
                password: password
              })
          })).json();

        if (result.error) {
            throw new Error(result.error);
        }

        return 'OK';
    }

    static async login(username, password) {
        let result = await (await fetch(baseUrl + '/token/create', {
            method: 'GET',
            headers: {
            'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64'),
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            }
        })).json();

        if (!result.access_token) {
            throw new Error('Invalid credentials');
        }

        await Storage.set(TOKEN_STORAGE_KEY, result);
        let userInfo = await Api._fetchUserInfo(result);
        await Storage.set(USER_INFO_KEY, userInfo);
        return 'OK';
    }

    static async _fetchUserInfo(token) {
        return await (await fetch(baseUrl + '/user/info', {
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + token.access_token,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              }
          })).json()
    }

    static async _getAccessToken() {
        return (await Storage.get(TOKEN_STORAGE_KEY)).access_token;
    }

    static async _getUserId() {
        return (await Storage.get(USER_INFO_KEY)).id;
    }

    static async uploadFile(fileUri, total, description) {
        let token = await Api._getAccessToken();
        let userId = await Api._getUserId();

        return new Promise(function(resolve, reject) {

            let xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                  resolve(JSON.parse(xhr.responseText));
                } else {
                  reject(new Error('Upload failed with status code ' + xhr.status));
                }
            };

            xhr.onerror = function() {
                reject(new Error(xhr.statusText));
            }

            xhr.open('POST', baseUrl + '/user/' + userId + '/receipt');
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            xhr.setRequestHeader('Accept', 'application/json');

            var receipt = {
                uri: fileUri,
                type: 'image/jpeg',
                name: 'receipt.jpg',
            };

            var formData = new FormData();
            formData.append('receipt', receipt);
            formData.append('filename', 'receipt.jpg');
            formData.append('total', total);
            formData.append('description', description);
            xhr.send(formData);
        });
    }

    static async updateReceipt(receiptId, fields) {
        let token = await Api._getAccessToken();
        let userId = await Api._getUserId();

        return await (await fetch(baseUrl + '/user/' + userId + '/receipt/' + receiptId, {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([{
                op: 'replace',
                path: '/description',
                value: fields.description
            }])
        })).json()
    }

    static async isLoggedIn() {
        let token = await Storage.get(TOKEN_STORAGE_KEY);

        if (token) {
            return true;
        }

        return false;
    }

    static async logout() {
        await Storage.remove(TOKEN_STORAGE_KEY);
        await Storage.remove(USER_INFO_KEY);
    }

    static async getReceipts() {
        let token = await Api._getAccessToken();
        let userId = await Api._getUserId();

        return await (await fetch(baseUrl + '/user/' + userId + '/receipt', {
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              }
          })).json()
    }
}

export default Api;
