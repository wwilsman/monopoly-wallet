import { gameDefaults } from '../../lib/defaults'

export const gameReducer = (state = gameDefaults, action) => {
  switch (action.type) {
    case 'UPDATE_GAME':
      return { ...state, ...action.state }

    default:
      return state
  }
}

export const playerReducer = (state = null, action) => {
  switch (action.type) {
    case 'SET_CURRENT_PLAYER':
      return action.playerID

    default:
      return state
  }
}

export const themeReducer = (state = {}, action) => {
  switch(action.type) {
    case 'UPDATE_THEME':
      return { ...state, ...action.theme }

    default:
      return state
  }
}
