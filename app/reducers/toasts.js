const initialState = []

const toastsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, {
        _id: Date.now(),
        type: action.toastType,
        content: action.content,
        timeout: action.timeout,
        buttons: action.buttons
      }]

    case 'REMOVE_TOAST':
      const i = state.findIndex((t) => t._id === action.toastID)
      return i === -1 ? state : [...state.slice(0, i), ...state.slice(i + 1)]

    case 'CLEAR_TIMED_TOASTS':
      return state.filter((t) => !t.timeout)

    default:
      return state
  }
}

export default toastsReducer
