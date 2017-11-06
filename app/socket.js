import {
  push
} from './actions/router';
import {
  appError,
  appDoneLoading,
  syncPlayers,
  setCurrentPlayer
} from './actions/app';
import {
  syncGame,
  connectToGame,
  voteInPoll,
  gameError,
  gameDoneLoading
} from './actions/game';
import {
  newPoll,
  removeToast
} from './actions/toasts';

import logger from './logger';

/**
 * Creates a hash of socket actions using a store that implements
 * `dispatch` and `getState`
 *
 * @param {Object} store - implements `dispatch` and `getState`
 */
const getSocketActions = ({ dispatch, getState }) => ({
  // when connected, the app is ready
  'connected': () => {
    dispatch(appDoneLoading());
  },

  // connect to the newly created game
  'game:created': (game) => {
    dispatch(connectToGame(game.id));
  },

  // joining a game will sync the game and players, send the player to
  // the dashboard, and tell the app the game is done loading
  'game:joined': ({ player, players, ...game }) => {
    dispatch(syncGame(game));
    dispatch(setCurrentPlayer(player));
    dispatch(syncPlayers(players));
    dispatch(push(`/${game.id}`));
    dispatch(gameDoneLoading());
  },

  // connecting to a new room will sync the game and players, send
  // the player to the join game screen if they aren't already tyring
  // to access a game screen, and tell the app the game is done loading
  'room:connected': ({ players, ...game }) => {
    const { router: { location }} = getState();

    dispatch(syncGame(game));
    dispatch(syncPlayers(players));

    if (!location.pathname.includes(game.id)) {
      dispatch(push(`/${game.id}/join`));
    }

    dispatch(gameDoneLoading());
  },

  // any sync event syncs the game and players
  'room:sync': ({ players, ...game }) => {
    dispatch(syncGame(game));
    dispatch(syncPlayers(players));
  },

  // a new poll will open a new poll toast
  'poll:new': ({ id, message }) => {
    const { game: { config }} = getState();
    const dismiss = removeToast(id);

    dispatch(newPoll(id, message, [
      { label: 'Yes', actions: [voteInPoll(id, true), dismiss] },
      { label: 'No', actions: [voteInPoll(id, false), dismiss] },
    ], config.pollTimeout));
  },

  // game errors can be handled differently depending on the context
  'game:error': (error) => {
    logger.error(error);
    dispatch(gameError(error.message));
  },

  // room errors usually mean something went wrong and are handled
  // higher up the hierarchy
  'room:error': (error) => {
    logger.error(error);
    dispatch(appError(error.message));
  }
});

/**
 * Redux middleware to dispatch and handle actions to and from the
 * game via websockets.
 *
 * @param {WebSocket} ws - WebSocket instance
 * @returns {Function} Redux middleware
 */
export default (ws) => (store) => {
  const actions = getSocketActions(store);

  // helper to stringify events and their args
  const emitEvent = (event, args) => {
    ws.send(JSON.stringify({ event, args }));
  };

  // on every event, we call a socket action defined above
  ws.addEventListener('message', ({ data }) => {
    let { event, args } = JSON.parse(data);

    if (actions[event]) {
      logger.log(`[socket:on] ${event}`, args);
      actions[event](...args);
    }
  });

  // log when the socket is closed
  ws.addEventListener('close', () => {
    logger.log('[socket:close]');
  });

  // the actual middleware will simply send a socket event defined in
  // the action's `socket` property along with arguments
  return (next) => (action) => {
    if (action.socket) {
      const {
        emit: event,
        args = [],
        reconnect
      } = action.socket;

      if (reconnect) {
        // sometimes we want to force a reconnect, to do this we send a
        // disconnect event to the server which will forcably disconnect
        // us, causing our client websocket to attempt to reconnect.
        // Upon reconnection, the normal flow of events take place.
        emitEvent('disconnect');
      } else {
        logger.log(`[socket:emit] ${event}`, args);
        emitEvent(event, args);
      }
    }

    // always continue to dispatch
    next(action);
  };
};
