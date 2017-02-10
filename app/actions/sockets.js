import io from 'socket.io-client'

import { setError } from './error'
import { updateGame } from './game'
import { setCurrentPlayer } from './player'

function handleError(error, message) {
  return (dispatch) => {
    if (error && message) {
      dispatch(setError(error, message))
    }
  }
}

const socketMiddleware = (store) => (next) => {
  const socket = io.connect('/game', { forceNew: true })

  const on = (event, actionCreator) => {
    socket.on(event, (...args) => {
      store.dispatch({ type: 'SOCKET_ON', event, args })
      store.dispatch(actionCreator(...args))
    })
  }

  on('game:error', handleError)
  on('game:update', updateGame)
  on('game:joined', setCurrentPlayer)
  //on('auction:new', )
  //on('auction:update', )
  //on('auction:end', )
  //on('message:new', )
  //on('trade:new', )
  //on('trade:decline', )
  //on('trade:end', )

  return (action) => {
    if (action.type === 'SOCKET_EMIT') {
      socket.emit(action.event, ...action.args)
    }

    return next(action)
  }
}

export default socketMiddleware
