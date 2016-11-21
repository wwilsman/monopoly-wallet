import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { reducer as formReducer } from 'redux-form'

export const rootReducer = combineReducers({
  form: formReducer,
  routing: routerReducer
})
