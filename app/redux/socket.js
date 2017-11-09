/**
 * Creates an action type from a socket event name
 * @param {String} name - event name
 */
export const event = (name) => (
  `SOCKET/${name.toUpperCase()}`
);

/**
 * Action creator for emitting events
 * @param {String} name - event name
 * @param {Mixed} ...args - event arguments
 */
export const emit = (name, ...args) => ({
  type: event(name),
  socket: { emit: name, args }
});

/**
 * Redux middleware to dispatch and handle actions to and from the
 * game via websockets.
 *
 * @param {WebSocket} ws - WebSocket instance
 * @returns {Function} Redux middleware
 */
export const middleware = (ws) => (store) => {

  // helper to stringify events and their args
  const emitEvent = (event, args) => {
    ws.send(JSON.stringify({ event, args }));
  };

  // on every event, we dispatch a socket event action
  ws.addEventListener('message', ({ data }) => {
    let evt = JSON.parse(data);

    store.dispatch({
      type: event(evt.name),
      ...evt.data
    });
  });

  // the actual middleware will simply send a socket event defined in
  // the action's `socket` property along with arguments
  return (next) => (action) => {
    if (action.socket) {
      let {
        emit: event,
        args = []
      } = action.socket;

      emitEvent(event, args);
    }

    // always continue to dispatch
    next(action);
  };
};
