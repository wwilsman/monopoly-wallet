import { voteInPoll } from './game'

export function showToast(message) {
  return { type: 'SHOW_TOAST', message }
}

export function showErrorToast(message) {
  return { type: 'SHOW_ERROR_TOAST', message }
}

export function showPollToast(poll, message) {
  return { type: 'SHOW_ERROR_TOAST', poll, message }
}

export function removeToast(toast) {
  return { type: 'REMOVE_TOAST', toast }
}

export function clearTimedToasts() {
  return { type: 'CLEAR_TIMED_TOASTS' }
}

const toasterMiddleware = (store) => (next) => (action) => {
  const { player } = store.getState()
  const middle = next(action)
  
  if (player && action.type === 'UPDATE_GAME') {
    const { game: { notice } } = action

    if (notice) {
      switch (notice.type) {
        case 'game':
          store.dispatch(showToast(notice.message))
          break;
        // case 'auction':
        // case 'trade':
      }
    }
  }

  return middle
}

export default toasterMiddleware
