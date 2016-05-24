export const NAVIGATE_TO_INIT = 'NAVIGATE_TO_INIT';
export const NAVIGATE_TO_LOGIN = 'NAVIGATE_TO_LOGIN';
export const NAVIGATE_TO_SIGNUP = 'NAVIGATE_TO_SIGNUP';
export const NAVIGATE_TO_RECEIPT_LIST = 'NAVIGATE_TO_RECEIPT_LIST';
export const NAVIGATE_TO_RECEIPT_VIEW = 'NAVIGATE_TO_RECEIPT_VIEW';
export const NAVIGATE_TO_RECEIPT_CREATE = 'NAVIGATE_TO_RECEIPT_CREATE';
export const NAVIGATE_TO_RECEIPT_EDIT = 'NAVIGATE_TO_RECEIPT_EDIT';

export function navigateToInit() {
    return {
        type: NAVIGATE_TO_INIT
    };
}

export function navigateToLogin() {
    return {
        type: NAVIGATE_TO_LOGIN
    };
}

export function navigateToSignup() {
    return {
        type: NAVIGATE_TO_SIGNUP
    };
}

export function navigateToReceiptList() {
    return {
        type: NAVIGATE_TO_RECEIPT_LIST
    };
}

export function navigateToReceiptCreate() {
    return {
        type: NAVIGATE_TO_RECEIPT_CREATE,
    };
}

export function navigateToReceiptView() {
    return {
        type: NAVIGATE_TO_RECEIPT_VIEW,
    };
}

export function navigateToReceiptEdit() {
    return {
        type: NAVIGATE_TO_RECEIPT_EDIT,
    };
}
