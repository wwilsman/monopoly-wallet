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
  reducer as gameReducer
} from './game';
import {
  reducer as configReducer
} from './config';
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
import {
  middleware as persistMiddleware
} from './persist';

// redux dev tools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// root reducer
const rootReducer = combineReducers({
  app: appReducer,
  game: gameReducer,
  config: configReducer,
  toasts: toastsReducer,
  router: routerReducer
});

// helper to create the initial state
const getInitialState = (history) => ({
  router: {
    location: {
      pathname: history.location.pathname,
      state: history.location.state || {}
    }
  }
});

/**
 * Creates a new redux store instance with our middleware and sets up
 * hot module reloading for reducers
 * @param {Socket} socket - Socket.io socket instance
 * @param {Object} history - Implements a history interface
 * @returns {Object} A new redux store
 */
export default ({ socket, history }) => {
  let store = createStore(
    rootReducer,
    getInitialState(history),
    composeEnhancers(
      applyMiddleware(
        routerMiddleware(history),
        socketMiddleware(socket),
        persistMiddleware(({ app }) => ({
          app: {
            room: app.room,
            player: app.player
          }
        }))
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
