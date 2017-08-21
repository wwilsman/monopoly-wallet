export const GAME_NEW = 'GAME_NEW';
export const GAME_SYNC = 'GAME_SYNC';
export const GAME_CONNECT = 'GAME_CONNECT';
export const GAME_DISCONNECT = 'GAME_DISCONNECT';
export const GAME_JOIN = 'GAME_JOIN';
export const GAME_ERROR = 'GAME_ERROR';
export const GAME_LOADING_DONE = 'GAME_LOADING_DONE';

export const newGame = () => ({
  type: GAME_NEW,
  socket: { emit: 'game:new' }
});

export const syncGame = (game) => ({
  type: GAME_SYNC,
  game
});

export const connectToGame = (room) => ({
  type: GAME_CONNECT,
  socket: {
    emit: 'room:connect',
    args: [room]
  }
});

export const disconnectGame = () => ({
  type: GAME_DISCONNECT
});

export const joinGame = ({ name, token }) => ({
  type: GAME_JOIN,
  socket: {
    emit: 'game:join',
    args: [name, token]
  }
});

export const gameError = (message) => ({
  type: GAME_ERROR,
  error: { message }
});

export const gameDoneLoading = () => ({
  type: GAME_LOADING_DONE
});
