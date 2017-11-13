import {
  applyMiddleware,
  combineReducers,
  compose,
  createStore
} from 'redux';

import {
  reducer as appReducer
} from './app';
import {
  reducer as toastsReducer
} from './toasts';
import {
  reducer as routerReducer,
  middleware as routerMiddleware
} from './router';
import {
  middleware as socketMiddleware
} from './socket';

// redux dev tools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// simple reducer creator to copy state from actions
const simpleReducer = (key, initialState = {}) => {
  return (state = initialState, action) => {
    return action.hasOwnProperty(key)
      ? { ...state, ...action[key] }
      : state;
  };
};

// root reducer
const rootReducer = combineReducers({
  app: appReducer,
  game: simpleReducer('game'),
  config: simpleReducer('config'),
  toasts: toastsReducer,
  router: routerReducer
});

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
    module.hot.accept('./store', () => {
      store.replaceReducer(rootReducer);
    });
  }

  return store;
};
