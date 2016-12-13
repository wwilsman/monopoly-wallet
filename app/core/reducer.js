import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import {
  gameReducer,
  playerReducer,
  themeReducer
} from '../game/reducers'

const rootReducer = combineReducers({
  routing: routerReducer,
  game: gameReducer,
  player: playerReducer,
  theme: themeReducer
})

export default rootReducer
