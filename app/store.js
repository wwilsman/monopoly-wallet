import { applyMiddleware, createStore, compose, } from 'redux';

import rootReducer from './reducers';
import socketMiddleware from './socket';
import routerMiddleware from './router';

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
  socket,
  history,
  initialState = {}
}) => {
  let store = createStore(
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
};
