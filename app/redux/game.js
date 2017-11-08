// action types
export const GAME_NEW = 'GAME_NEW';
export const GAME_SYNC = 'GAME_SYNC';
export const GAME_CONNECT = 'GAME_CONNECT';
export const GAME_DISCONNECT = 'GAME_DISCONNECT';
export const GAME_JOIN = 'GAME_JOIN';
export const GAME_POLL_VOTE = 'GAME_POLL_VOTE';
export const GAME_ERROR = 'GAME_ERROR';
export const GAME_LOADING_DONE = 'GAME_LOADING_DONE';

// action creators
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
  type: GAME_DISCONNECT,
  socket: {
    reconnect: true
  }
});

export const joinGame = ({ name, token }) => ({
  type: GAME_JOIN,
  socket: {
    emit: 'game:join',
    args: [name, token]
  }
});

export const voteInPoll = (id, vote) => ({
  type: GAME_POLL_VOTE,
  socket: {
    emit: 'poll:vote',
    args: [id, vote]
  }
});

export const gameError = (message) => ({
  type: GAME_ERROR,
  error: { message }
});

export const gameDoneLoading = () => ({
  type: GAME_LOADING_DONE
});

// initial state
const initialState = {
  room: '',
  loading: false,
  error: '',
  theme: '',
  state: {},
  config: {}
};

// reducer
export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GAME_NEW:
    case GAME_CONNECT:
    case GAME_JOIN:
      return { ...state,
        loading: true
      };

    case GAME_SYNC:
      return { ...state,
        room: action.game.id,
        theme: action.game.theme,
        state: action.game.state,
        config: action.game.config
      };

    case GAME_ERROR:
      return { ...state,
        error: action.error.message,
        loading: false
      };

    case GAME_LOADING_DONE:
      return { ...state,
        loading: false
      };

    case GAME_DISCONNECT:
      return { ...initialState };

    default:
      return state;
  }
};
