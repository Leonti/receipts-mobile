import Storage from './Storage';
import NetworkFiles from './NetworkFiles';
import ReceiptsUploader from './ReceiptsUploader';

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

    static async getUserInfo() {
        return await Storage.get(USER_INFO_KEY);
    }

    static async _getAccessToken() {
        return (await Storage.get(TOKEN_STORAGE_KEY)).access_token;
    }

    static async _getUserId() {
        return (await Storage.get(USER_INFO_KEY)).id;
    }

    static async downloadReceiptFile(receiptId, fileId, fileExt) {
        let token = await Api._getAccessToken();
        let userId = await Api._getUserId();

        let result = await NetworkFiles.download({
            url: baseUrl + '/user/' + userId + '/receipt/' + receiptId + '/file/' + fileId + '.' + fileExt,
            headers: {'Authorization': 'Bearer ' + token}
        });

        return 'file://' + result.file;
    }

    static async uploadFile(fileUri, total, description) {
        let token = await Api._getAccessToken();
        let userId = await Api._getUserId();

        return new Promise(function(resolve, reject) {

            let xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {

                    let receipt = JSON.parse(xhr.responseText);

                    let file = receipt.files[0];
                    let url = baseUrl + '/user/' + userId + '/receipt/' + receipt.id + '/file/' + file.id + '.' + file.ext;
                    console.log('Receipt uloaded ' + fileUri, url);

                    let cachedFilePromise = NetworkFiles.addToCache({
                        url: url,
                        file: fileUri
                    }).then(() => receipt);
                    resolve(cachedFilePromise);
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
            formData.append('total', total === null ? '' : total);
            formData.append('description', description === null ? '' : description);
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
            },
            {
                op: 'replace',
                path: '/total',
                value: toTotalValue(fields.total)
            }])
        })).json()
    }

    static async batchUpload(files) {
        let token = await Api._getAccessToken();
        let userId = await Api._getUserId();

        return (await ReceiptsUploader.submit({
            files: files,
            token: token,
            uploadUrl: baseUrl + '/user/' + userId + '/receipt',
        }));
    }

    static async deleteReceipt(receiptId) {
        let token = await Api._getAccessToken();
        let userId = await Api._getUserId();

        return await fetch(baseUrl + '/user/' + userId + '/receipt/' + receiptId, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
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

function toTotalValue(total) {
    try {
        let result = parseFloat(total);
        if (isNaN(result)) {
            return null;
        }

        return result;
    } catch (e) {
        return null;
    }
}

export default Api;
