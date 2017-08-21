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
  gameError,
  gameDoneLoading
} from './actions/game';

const getSocketActions = ({ dispatch, getState }) => ({
  'connect': () => {
    dispatch(appDoneLoading());
  },

  'game:created': (game) => {
    dispatch(syncGame(game));
    dispatch(push(`/${game.id}/join`));
    dispatch(gameDoneLoading());
  },

  'game:joined': ({ token, room }) => {
    dispatch(setCurrentPlayer(token));
    dispatch(push(`/${room}`));
    dispatch(gameDoneLoading());
  },

  'room:connected': ({ players, ...game }) => {
    dispatch(syncGame(game));
    dispatch(syncPlayers(players));
    dispatch(gameDoneLoading());
  },

  'room:sync': ({ players, ...game }) => {
    dispatch(syncGame(game));
    dispatch(syncPlayers(players));
  },

  'game:error': (error) => {
    dispatch(gameError(error.message));
  },

  'room:error': (error) => {
    dispatch(appError(error.message));
  }
});

export default (socket) => (store) => {
  const actions = getSocketActions(store);

  for (let event in actions) {
    socket.on(event, (...args) => {
      actions[event](...args);
    });
  }

  return (next) => (action) => {
    if (action.socket) {
      const { emit, args = [] } = action.socket;
      socket.emit(emit, ...args);
    }

    next(action);
  };
};
