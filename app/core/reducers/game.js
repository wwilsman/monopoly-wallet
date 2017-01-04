const gameReducer = (state = { players: [], properties: [] }, action) => {
  switch (action.type) {
    case 'UPDATE_GAME':
      return { ...state, ...action.state }

    default:
      return state
  }
}

export default gameReducer
