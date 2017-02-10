import { voteInPoll } from './game'

export function addToast(toastType, content, { timeout, buttons }) {
  return { type: 'ADD_TOAST', toastType, content, timeout, buttons }
}

export function removeToast(toastID) {
  return { type: 'REMOVE_TOAST', toastID }
}

export function clearTimedToasts() {
  return { type: 'CLEAR_TIMED_TOASTS' }
}

export function triggerError(message) {
  return addToast('error', message, {
    timeout: 5000
  })
}

export function triggerNotice(message) {
  return addToast('notice', message, {
    timeout: 5000
  })
}

export function triggerPoll(pollID, message) {
  return addToast('poll', message, {
    meta: { pollID },
    buttons: [{
      label: 'no',
      action: voteInPoll(pollID, false)
    }, {
      label: 'yes',
      action: voteInPoll(pollID, true)
    }]
  })
}

export function removePoll(pollID) {
  return (dispatch, getState) => {
    const toast = getState().toasts.find((t) => {
      return t.meta && pollID === t.meta.pollID
    })

    if (toast) {
      dispatch(removeToast(toast._id))
    }
  }
}
