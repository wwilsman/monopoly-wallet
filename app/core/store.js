import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import { rootReducer } from './RootReducer'

const loggerMiddleware = createLogger()

export function configureStore(initialState = {}) {
  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(
      thunkMiddleware,
      loggerMiddleware
    )
  )

  if (module.hot) {
    module.hot.accept('./RootReducer', () => {
      store.replaceReducer(rootReducer)
    })
  }

  return store
}
