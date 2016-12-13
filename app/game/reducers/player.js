const playerReducer = (state = null, action) => {
  switch (action.type) {
    case 'SET_CURRENT_PLAYER':
      return action.playerID

    default:
      return state
  }
}

export default playerReducer
