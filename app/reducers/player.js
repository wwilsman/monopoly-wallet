const player = (state = { name: '', token: '' }, action) => {
  switch (action.type) {
    case 'UPDATE_PLAYER':
      return { ...state, ...action.player }
    default:
      return state
  }
}

export default player
