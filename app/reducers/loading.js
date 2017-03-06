const loadingReducer = (state = false, action) => {
  switch (action.type) {
    case 'CONNECT_GAME':
    case 'JOIN_GAME':
      return action.type
      
    case 'ERROR':
    case 'GAME_CONNECTED':
    case 'SET_CURRENT_PLAYER':
      return false

    default:
      return state
  }
}

export default loadingReducer
