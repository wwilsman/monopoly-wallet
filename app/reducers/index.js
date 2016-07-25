import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import gameReducer from './game'
import playerReducer from './player'

const appReducer = combineReducers({
  game: gameReducer,
  player: playerReducer,
  form: formReducer
})

export default appReducer
