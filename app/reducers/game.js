import {
  GAME_NEW,
  GAME_SYNC,
  GAME_CONNECT,
  GAME_ERROR,
  GAME_LOADING_DONE
} from '../actions/game';

const initialState = {
  room: '',
  loading: false,
  error: '',
  theme: '',
  state: {},
  config: {}
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GAME_NEW:
    case GAME_CONNECT:
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

    default:
      return state;
  }
};
