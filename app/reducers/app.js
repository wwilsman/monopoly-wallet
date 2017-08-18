import {
  APP_ERROR,
  APP_LOADING_DONE,
  APP_PLAYERS_SYNC,
  APP_SET_PLAYER,
} from '../actions/app';

const initialState = {
  error: '',
  loading: true,
  player: null,
  players: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case APP_ERROR:
      return { ...state,
        error: action.error.message,
        loading: false
      };

    case APP_LOADING_DONE:
      return { ...state,
        loading: false
      };

    case APP_PLAYERS_SYNC:
      return { ...state,
        players: action.players
      };

    case APP_SET_PLAYER:
      return { ...state,
        player: action.player
      };

    default:
      return state;
  }
};
