import { combineReducers } from 'redux'

import errorReducer from './error'
import loadingReducer from './loading'
import gameReducer from './game'
import themeReducer from './theme'
import toastsReducer from './toasts'
import playerReducer from './player'

const rootReducer = combineReducers({
  error: errorReducer,
  loading: loadingReducer,
  game: gameReducer,
  theme: themeReducer,
  toasts: toastsReducer,
  player: playerReducer
})

export default rootReducer
