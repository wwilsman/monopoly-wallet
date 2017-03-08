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
  const { loading, player } = store.getState()
  const middle = next(action)
  
  if (player && action.type === 'UPDATE_GAME') {
    const { game: { notice } } = action

    if (notice) {
      switch (notice.type) {
        case 'game':
          store.dispatch(showToast(notice.message))
          break

        case 'auction:new':
          if (!loading.includes('AUCTION_PROPERTY')) {
            const { property } = action.game.auction
            store.dispatch(showAuctionToast(property, notice.message))
          }
          break

        // case 'trade':
      }
    }
  }

  return middle
}

export default toasterMiddleware
