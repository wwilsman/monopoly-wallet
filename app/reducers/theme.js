const initialState = {
  tokens: []
}

const themeReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_THEME':
      return {
        ...state,
        ...action.payload
      }

    case 'CLEAR_THEME':
      return { ...initialState }

    default:
      return state
  }
}

export default themeReducer
