export function showToast(message) {
  return { type: 'SHOW_TOAST', message }
}

export function showErrorToast(message) {
  return { type: 'SHOW_ERROR_TOAST', message }
}

export function showPollToast(poll, message) {
  return { type: 'SHOW_ERROR_TOAST', poll, message }
}

export function showAuctionToast(property, message) {
  return { type: 'SHOW_AUCTION_TOAST', property, message }
}

export function removeToast(toast) {
  return { type: 'REMOVE_TOAST', toast }
}

export function clearTimedToasts() {
  return { type: 'CLEAR_TIMED_TOASTS' }
}

const toasterMiddleware = (store) => (next) => (action) => {
  const { loading, player, toasts } = store.getState()
  const middle = next(action)
  
  if (player && action.type === 'UPDATE_GAME') {
    const { game: { notice } } = action
    const meta = notice ? notice.meta : {}

    if (notice) {
      switch (meta.action) {
        case 'auction:new':
          store.dispatch(showAuctionToast(meta.property, notice.message))
          break

        case 'auction:concede':
          if (meta.players.includes(player)) {
            toasts.filter((t) => t.type === 'auction').forEach((t) => {
              store.dispatch(removeToast(t._id))
            })
          }

          break

        case 'auction:end':
          toasts.filter((t) => t.type === 'auction').forEach((t) => {
            store.dispatch(removeToast(t._id))
          })

        case undefined:
          store.dispatch(showToast(notice.message))
      }
    }
  }

  return middle
}

export default toasterMiddleware
