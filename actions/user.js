import Api from '../services/Api';

export const SET_LOGGED_IN_USER = 'SET_LOGGED_IN_USER';
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_RESULT = 'LOGIN_RESULT';
export const LOGIN_REQUEST_FAILURE = 'LOGIN_REQUEST_FAILURE';
export const LOGIN_WITH_GOOGLE_REQUEST = 'LOGIN_WITH_GOOGLE_REQUEST';
export const LOGIN_CLEAR = 'LOGIN_CLEAR';
export const LOGOUT = 'LOGOUT';

export const CREATE_USER_REQUEST = 'CREATE_USER_REQUEST';
export const CREATE_USER_RESULT = 'CREATE_USER_RESULT';
export const CREATE_USER_REQUEST_FAILURE = 'CREATE_USER_REQUEST_FAILURE';
export const CREATE_USER_CLEAR = 'CREATE_USER_CLEAR';

export function setLoggedInUser(user) {
    return {
        type: SET_LOGGED_IN_USER,
        user,
    };
}

/* LOGIN */
export function login(username, password, postLoginAction) {

    return function(dispatch) {
        dispatch({
            type: LOGIN_REQUEST
        });

        return Api.login(username, password).then(Api.getUserInfo).then(result => {
            dispatch({
                type: LOGIN_RESULT,
                result,
            })
            postLoginAction()
        }, error => {
            dispatch({
                type: LOGIN_REQUEST_FAILURE,
                error: error.message,
            });
        });
    }
}

export function loginWithGoogle(idToken, postLoginAction) {

    return function(dispatch) {
        dispatch({
            type: LOGIN_WITH_GOOGLE_REQUEST
        });

        return Api.loginWithGoogle(idToken).then(Api.getUserInfo).then(result => {
            dispatch({
                type: LOGIN_RESULT,
                result,
            })
            postLoginAction()
        }, error => {
            dispatch({
                type: LOGIN_REQUEST_FAILURE,
                error: error.message,
            });
        });
    }
}

export function clearLogin() {
    return {
        type: LOGIN_CLEAR
    }
}

export function logout() {
    Api.logout();
    return {
        type: LOGOUT
    };
}

/* CREATE USER */

export function createUser(username, password, postSignupAction) {

    return function(dispatch) {
        dispatch({
            type: CREATE_USER_REQUEST,
        });

        return Api.createUser(username, password).then(result => {
            dispatch({
                type: CREATE_USER_RESULT,
                result,
            })
            postSignupAction()
        }, error => {
            dispatch({
                type: CREATE_USER_REQUEST_FAILURE,
                error: error.message,
            });
        });
    }
}

export function clearCreateUser() {
    return {
        type: CREATE_USER_CLEAR
    }
}
