import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import { gameReducer } from './game'

export const rootReducer = combineReducers({
  routing: routerReducer,
  game: gameReducer
})
