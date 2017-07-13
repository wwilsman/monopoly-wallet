import {
  push
} from 'react-router-redux';
import {
  appError,
  appDoneLoading
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
  'game:error': (dispatch) => (error) => {
    console.error(`${error.name}: ${error.message}`);
    dispatch(gameError(error.message));
  },
  'room:error': (dispatch) => (error) => {
    console.error(`${error.name}: ${error.message}`);
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
