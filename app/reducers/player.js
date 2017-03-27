const playerReducer = (state = null, action) => {
  switch (action.type) {
    case 'GAME_JOINED':
    case 'SET_CURRENT_PLAYER':
      return action.player

    default:
      return state
  }
}

export default playerReducer
