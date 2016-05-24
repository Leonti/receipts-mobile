import {
    NAVIGATE_TO_INIT,
    NAVIGATE_TO_LOGIN,
    NAVIGATE_TO_SIGNUP,
    NAVIGATE_TO_RECEIPT_LIST,
    NAVIGATE_TO_RECEIPT_VIEW,
    NAVIGATE_TO_RECEIPT_CREATE,
    NAVIGATE_TO_RECEIPT_EDIT,
} from '../actions/navigation'

function navigate(state = {
    page: 'loader',
    data: {}
}, action) {

    switch(action.type) {
        case NAVIGATE_TO_INIT:
            return Object.assign({}, state, {
                page: 'INIT',
            });
        case NAVIGATE_TO_LOGIN:
            return Object.assign({}, state, {
                page: 'LOGIN',
            });
        case NAVIGATE_TO_SIGNUP:
            return Object.assign({}, state, {
                page: 'SIGNUP',
            });
        case NAVIGATE_TO_RECEIPT_LIST:
            return Object.assign({}, state, {
                page: 'RECEIPT_LIST',
            });
        case NAVIGATE_TO_RECEIPT_CREATE:
            return Object.assign({}, state, {
                page: 'RECEIPT_CREATE',
            });
        case NAVIGATE_TO_RECEIPT_VIEW:
            return Object.assign({}, state, {
                page: 'RECEIPT_VIEW',
            });
        case NAVIGATE_TO_RECEIPT_EDIT:
            return Object.assign({}, state, {
                page: 'RECEIPT_EDIT',
            });

        default:
            return state;
    }
}

export default navigate;
