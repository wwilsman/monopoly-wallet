const game = (state = {}, action) => {
  switch (action.type) {
    case 'SWITCH_THEME':
      return {
        ...state,
        theme: action.value
      }
    default:
      return state
  }
}

export default game
