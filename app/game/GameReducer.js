export const gameReducer = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_GAME':
      return { ...state, ...action.state }

    default:
      return state
  }
}

export const themeReducer = (state = {}, action) => {
  switch(action.type) {
    case 'UPDATE_THEME':
      return { ...state, ...action.theme }

    default:
      return state
  }
}
