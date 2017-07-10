const socketActions = [
];

export default (socket) => (store) => {
  socketActions.forEach(([event, ...actions]) => {
    socket.on(event, (...args) => {
      actions.forEach((action) => store.dispatch(action(...args)));
    });
  });

  return (next) => (action) => {
    if (action.socket) {
      const { emit, args = [] } = action.socket;
      socket.emit(emit, ...args);
    }

    next(action);
  };
};
