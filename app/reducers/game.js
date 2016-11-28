export const gameReducer = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_THEME':
      return { ...state,
        theme: action.theme,
        tokens: action.tokens,
        icons: action.icons
      }

    case 'UPDATE_PLAYERS':
      return { ...state,
        players: action.players || []
      }

    default:
      return state
  }
}
