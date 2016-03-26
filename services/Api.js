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

    static async uploadFile(fileUri, progressCallback) {
        let token = (await Storage.get(TOKEN_STORAGE_KEY)).access_token;
        let userId = (await Storage.get(USER_INFO_KEY)).id;

        return new Promise(function(resolve, reject) {

            let xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                  resolve(JSON.parse(xhr.responseText));
                } else {
                  reject(xhr.statusText);
                }
            };

            xhr.onerror = function() {
                reject(xhr.statusText);
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
            xhr.send(formData);
        });
    }
}

export default Api;
