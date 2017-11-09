import { event, emit } from './socket';

// action creators
export const newGame = emit.bind(null, 'game:new');
export const connectToGame = emit.bind(null, 'room:connect');
export const disconnectGame = emit.bind(null, 'room:disconnect');
export const joinGame = emit.bind(null, 'game:join');

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
    case event('game:new'):
    case event('game:join'):
    case event('room:connect'):
      return { ...state,
        loading: true
      };

    case event('game:created'):
    case event('game:joined'):
    case event('room:connected'):
    case event('room:sync'):
      return { ...state,
        room: action.game.id,
        theme: action.game.theme,
        state: action.game.state,
        config: action.game.config,
        loading: false
      };

    case event('game:error'):
      return { ...state,
        error: action.error.message,
        loading: false
      };

    case event('room:disconnect'):
      return { ...initialState };

    default:
      return state;
  }
};
