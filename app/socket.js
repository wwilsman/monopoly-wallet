import {
  push
} from 'react-router-redux';
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

const getSocketActions = ({ dispatch, getState }) => ({
  'connect': () => {
    dispatch(appDoneLoading());
  },

  'game:created': (game) => {
    dispatch(connectToGame(game.id));
  },

  'game:joined': ({ player, players, ...game }) => {
    dispatch(syncGame(game));
    dispatch(setCurrentPlayer(player));
    dispatch(syncPlayers(players));
    dispatch(push(`/${game.id}`));
    dispatch(gameDoneLoading());
  },

  'room:connected': ({ players, ...game }) => {
    const { router: { location }} = getState();

    dispatch(syncGame(game));
    dispatch(syncPlayers(players));

    if (!location.pathname.includes(game.id)) {
      dispatch(push(`/${game.id}/join`));
    }

    dispatch(gameDoneLoading());
  },

  'room:sync': ({ players, ...game }) => {
    dispatch(syncGame(game));
    dispatch(syncPlayers(players));
  },

  'poll:new': ({ id, message }) => {
    const { game: { config }} = getState();
    const dismiss = removeToast(id);

    dispatch(newPoll(id, message, [
      { label: 'Yes', actions: [voteInPoll(id, true), dismiss] },
      { label: 'No', actions: [voteInPoll(id, false), dismiss] },
    ], config.pollTimeout));
  },

  'game:error': (error) => {
    logger.error(error);
    dispatch(gameError(error.message));
  },

  'room:error': (error) => {
    logger.error(error);
    dispatch(appError(error.message));
  }
});

export default (socket) => (store) => {
  const actions = getSocketActions(store);

  for (let event in actions) {
    socket.on(event, (...args) => {
      logger.log(`socket.on(${event})`, args);
      actions[event](...args);
    });
  }

  return (next) => (action) => {
    if (action.socket) {
      const {
        emit,
        args = [],
        reconnect
      } = action.socket;

      if (reconnect) {
        socket.close().open();
        logger.log('socket reconnected');
      } else {
        logger.log(`socket.emit(${emit})`, args);
        socket.emit(emit, ...args);
      }
    }

    next(action);
  };
};
