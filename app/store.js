import { applyMiddleware, createStore, compose, } from 'redux';
import { routerMiddleware } from 'react-router-redux';

import rootReducer from './reducers';
import socketMiddleware from './socket';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

/**
 * Creates a new redux store instance with our middleware and sets up
 * hot module reloading for reducers
 * @param {Object} [initialState] The initial app state
 * @param {Object} history - Implements a history interface
 * @param {Socket} socket - Socket.io socket instance
 * @returns {Object} A new redux store
 */
export default ({
  initialState = {},
  history,
  socket
}) => {
  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(
      applyMiddleware(
        routerMiddleware(history),
        socketMiddleware(socket)
      )
    )
  );

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      store.replaceReducer(rootReducer);
    });
  }

  return store;
}
