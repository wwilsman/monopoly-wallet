import { event } from './socket';

// initial state
const initialState = {
  error: '',
  loading: true,
  player: null,
  players: []
};

// reducer
export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case event('room:error'):
      return { ...state,
        error: action.error.message,
        loading: false
      };

    case event('connected'):
      return { ...state,
        loading: false
      };

    case event('game:joined'):
    case event('room:connected'):
    case event('room:sync'):
      return { ...state,
        players: action.players,
        player: action.player || state.player
      };

    default:
      return state;
  }
};
