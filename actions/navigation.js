export const NAVIGATE_TO = 'NAVIGATE_TO';
export const NAVIGATE_TO_AND_RESET = 'NAVIGATE_TO_AND_RESET';
export const NAVIGATE_BACK = 'NAVIGATE_BACK';

export function navigateTo(page) {
    return {
        type: NAVIGATE_TO,
        page: page,
    };
}

export function navigateToAndReset(page) {
    return {
        type: NAVIGATE_TO_AND_RESET,
        page: page,
    };
}

export function navigateBack() {
    return {
        type: NAVIGATE_BACK,
    };
}
