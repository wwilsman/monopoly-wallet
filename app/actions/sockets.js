import io from 'socket.io-client'

const socketActions = {
  'room:error': 'ERROR',
  'room:connected': 'GAME_CONNECTED',
  'game:error': 'SHOW_ERROR_TOAST',
  'game:update': 'UPDATE_GAME',
  'game:joined': 'GAME_JOINED',
  'poll:new': 'SHOW_POLL_TOAST',
  'poll:end': 'REMOVE_POLL_TOAST',
  'message:new': 'NEW_MESSAGE'
}

const socketMiddleware = (store) => (next) => {
  const socket = io.connect('/', { forceNew: true })

  for (const [event, action] of Object.entries(socketActions)) {
    socket.on(event, (data) => {
      store.dispatch({ type: action, ...data })
    })
  }

  return (action) => {
    if (action.event) {
      socket.emit(action.event, action.payload)
    }

    if (action.type === 'DISCONNECT_GAME') {
      socket.disconnect()
      socket.connect()
    }

    return next(action)
  }
}

export default socketMiddleware
