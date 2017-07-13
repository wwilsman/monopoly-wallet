import {
  GAME_NEW,
  GAME_SYNC,
  GAME_ERROR,
  GAME_LOADING_DONE
} from '../actions/game';

const initialState = {
  error: false,
  loading: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GAME_NEW:
      return { ...state,
        loading: true
      };

    case GAME_SYNC:
      return { ...state,
        ...action.game
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
