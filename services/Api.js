class Api {
    constructor() {
        this.baseUrl = 'https://api.receipts.leonti.me'
    }

    createUser(username, password) {
        return new Promise(function(resolve, reject) {

            setTimeout(function() {
                resolve({id: 'userId', userName: username});
                //reject('Username already exist');
            }, 500);
        });
    }

    login(username, password) {
        return new Promise(function(resolve, reject) {

            setTimeout(function() {
/*
                resolve({
                    "token_type": "bearer",
                    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NTc4MzQ5MDAsImV4cCI6MTQ2MTQzNDkwMCwic3ViIjoiNDZmODkwODUtMzY2MC00NmNkLTg5YzgtMjgwN2M2NjVmZmJhIiwibmFtZSI6ImNpX3VzZXJfZTgxMGU4N2QtYTRiYi00MDk2LWFlODktNjhiODg3YzRhN2IxIn0.yCi3b9d7kxPKI81Ik34Wv0OqINymrV72IhW67YnkhDM",
                    "expires_in": 3600000
                });
*/
                reject('Invalid credentials');
            }, 500);
        });
    }
}

export default new Api();
