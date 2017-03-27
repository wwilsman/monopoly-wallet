const initialState = {
  active: [],
  players: [],
  properties: [],
}

const gameReducer = (state = initialState, action) => {
  switch(action.type) {
    case 'GAME_CONNECTED':
    case 'GAME_JOINED':
    case 'UPDATE_GAME':
      return { ...state, ...action.game }

    case 'DISCONNECT_GAME':
      return { ...initialState }

    default:
      return state
  }
}

export default gameReducer
