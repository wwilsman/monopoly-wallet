const initialState = {
  playerTokens: [],
  groupColors: {}
}

const themeReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GAME_CONNECTED':
      return { ...state, ...action.theme }

    case 'DISCONNECT_GAME':
      return { ...initialState }

    default:
      return state
  }
}

export default themeReducer
