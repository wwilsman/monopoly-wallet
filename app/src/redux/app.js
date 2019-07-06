import { event } from './socket';

// initial state
const initialState = {
  room: '',
  theme: '',
  error: '',
  waiting: ['connected'],
  player: null,
  players: []
};

// events that need to wait for other events
const wait = {
  'game:new': 'game:created',
  'game:join': 'game:joined',
  'room:connect': 'room:connected',
  'player:transfer': 'game:update'
};

// app reducer
export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case event('game:error'):
    case event('room:error'):
      return { ...state,
        error: action.error.message,
        waiting: []
      };

    case event('game:new'):
    case event('game:join'):
    case event('room:connect'):
    case event('player:transfer'):
      return { ...state,
        waiting: [
          ...state.waiting,
          wait[action.socket.event]
        ]
      };

    case event('connected'):
    case event('game:created'):
    case event('game:joined'):
    case event('game:update'):
    case event('room:connected'):
    case event('room:sync'):
      return { ...state,
        room: action.room || state.room,
        theme: action.theme || state.theme,
        players: action.players || state.players,
        player: action.player || state.player,
        waiting: state.waiting.filter((event) => (
          event !== action.socket.on
        ))
      };

    case event('room:disconnect'):
      return {
        ...initialState,
        waiting: []
      };

    default:
      return state;
  }
};
