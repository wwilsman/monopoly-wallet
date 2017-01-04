const themeReducer = (state = { tokens: [] }, action) => {
  switch(action.type) {
    case 'UPDATE_THEME':
      return { ...state, ...action.theme }

    default:
      return state
  }
}

export default themeReducer
