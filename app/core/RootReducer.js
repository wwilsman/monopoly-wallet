import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import { gameReducer, themeReducer } from '../game'

export const rootReducer = combineReducers({
  routing: routerReducer,
  theme: themeReducer,
  game: gameReducer,
})
