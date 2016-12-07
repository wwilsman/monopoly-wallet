import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import {
  gameReducer,
  playerReducer,
  themeReducer
} from '../game'

export const rootReducer = combineReducers({
  routing: routerReducer,
  game: gameReducer,
  currentPlayer: playerReducer,
  theme: themeReducer
})
