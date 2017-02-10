import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import errorReducer from './error'
import themeReducer from './theme'
import gameReducer from './game'
import playerReducer from './player'

const rootReducer = combineReducers({
  routing: routerReducer,
  error: errorReducer,
  theme: themeReducer,
  game: gameReducer,
  player: playerReducer
})

export default rootReducer
