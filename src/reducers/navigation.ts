import { Action } from '../actions/navigation'

import { Navigation } from './store'

const initialState: Navigation = {
  page: '',
  history: []
}

function navigate(state: Navigation = initialState, action: Action): Navigation {
  console.log('ACTION:' + JSON.stringify(action))

  switch (action.type) {
    case 'NAVIGATE_TO':
      return Object.assign({}, state, {
        page: action.page,
        history: state.history.concat(action.page)
      })
    case 'NAVIGATE_TO_AND_RESET':
      return Object.assign({}, state, {
        page: action.page,
        history: [action.page]
      })
    case 'NAVIGATE_BACK':
      return Object.assign({}, state, {
        page: state.history.length >= 1 ? state.history[state.history.length - 2] : state.history[state.history.length - 1],
        history: state.history.length > 1 ? state.history.slice(0, state.history.length - 1) : state.history
      })
    default:
      return state
  }
}

export default navigate
