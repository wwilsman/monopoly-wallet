const triggerActions = [
  ['CONNECT_GAME', 'GAME_CONNECTED'],
  ['JOIN_GAME', 'SET_CURRENT_PLAYER'],
  ['AUCTION_PROPERTY', 'UPDATE_GAME', ({ game }) =>
    game.notice && game.notice.meta.action === 'auction:new'],
]

const shouldLoadAction = (action) => {
  return !!triggerActions.find((a) => a[0] === action.type)
}

const getLoadingAction = (action) => {
  const loading = triggerActions.find((a) => {
    return a[1] === action.type && (!a[2] || a[2](action))
  })

  return loading && loading[0]
}

const loadingReducer = (state = [], action) => {
  switch (action.type) {
    case 'ERROR':
      return []

    default:
      const loaded = getLoadingAction(action)
      const i = loaded ? state.indexOf(loaded) : -1

      if (i > -1) {
        return [
          ...state.slice(0, i),
          ...state.slice(i + 1)
        ]
      }

      if (!state.includes(action.type) &&
          shouldLoadAction(action)) {
        return [...state, action.type]
      }

      return state
  }
}

export default loadingReducer
