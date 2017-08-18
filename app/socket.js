import {
  push
} from 'react-router-redux';
import {
  appError,
  appDoneLoading,
  syncPlayers
} from './actions/app';
import {
  syncGame,
  gameError,
  gameDoneLoading
} from './actions/game';

const socketActions = {
  'connect': (dispatch) => () => {
    dispatch(appDoneLoading());
  },
  'game:created': (dispatch) => (game) => {
    dispatch(syncGame(game));
    dispatch(push(`/${game.id}/join`));
    dispatch(gameDoneLoading());
  },
  'room:connected': (dispatch) => ({ players, ...game }) => {
    dispatch(syncGame(game));
    dispatch(syncPlayers(players));
    dispatch(gameDoneLoading());
  },
  'room:sync': (dispatch) => ({ players, ...game }) => {
    dispatch(syncGame(game));
    dispatch(syncPlayers(players));
  },
  'game:error': (dispatch) => (error) => {
    dispatch(gameError(error.message));
  },
  'room:error': (dispatch) => (error) => {
    dispatch(appError(error.message));
  }
};

export default (socket) => (store) => {
  for (let event in socketActions) {
    const action = socketActions[event];
    socket.on(event, action(store.dispatch));
  }

  return (next) => (action) => {
    if (action.socket) {
      const { emit, args = [] } = action.socket;
      socket.emit(emit, ...args);
    }

    next(action);
  };
};
