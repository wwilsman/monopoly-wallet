const initialState = { players: [], properties: [] }

const gameReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_GAME':
      return { ...state, ...action.state }

    default:
      return state
  }
}

export default gameReducer
