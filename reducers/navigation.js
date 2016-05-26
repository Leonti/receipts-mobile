import {
    NAVIGATE_TO,
    NAVIGATE_TO_AND_RESET,
    NAVIGATE_BACK,
} from '../actions/navigation'

function findPrevPage(history) {
    if (history.length == 0) {
        return
    }
    if (history.length == 1) {
        return history[history.length - 1]
    }
}

function navigate(state = {
    page: null,
    history: []
}, action) {

    switch(action.type) {
        case NAVIGATE_TO:
            return Object.assign({}, state, {
                page: action.page,
                history: state.history.concat(action.page),
            });
        case NAVIGATE_TO_AND_RESET:
            return Object.assign({}, state, {
                page: action.page,
                history: [action.page],
            });
        case NAVIGATE_BACK:
            return Object.assign({}, state, {
                page: state.history.length > 1 ? state.history[state.history.length - 2] : state.history[state.history.length - 1],
                history: state.history.length > 1 ? state.history.slice(0, state.history.length - 2) : state.history,
            });
        default:
            return state;
    }
}

export default navigate;
