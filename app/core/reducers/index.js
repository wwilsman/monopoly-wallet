import { combineReducers } from 'redux'

import routerReducer from './router'
import gameReducer from './game'
import themeReducer from './theme'
import playerReducer from './player'

const rootReducer = combineReducers({
  routing: routerReducer,
  game: gameReducer,
  player: playerReducer,
  theme: themeReducer
})

export default rootReducer
