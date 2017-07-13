import {
  appDoneLoading
} from './actions/app';

const socketActions = {
  'connect': (dispatch) => () => {
    dispatch(appDoneLoading());
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
