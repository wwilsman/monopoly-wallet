// action types
export const APP_ERROR = 'APP_ERROR';
export const APP_LOADING_DONE = 'APP_LOADING_DONE';
export const APP_PLAYERS_SYNC = 'APP_PLAYERS_SYNC';
export const APP_SET_PLAYER = 'APP_SET_PLAYER';

// action creators
export const appError = (message) => ({
  type: APP_ERROR,
  error: { message }
});

export const appDoneLoading = () => ({
  type: APP_LOADING_DONE
});

export const syncPlayers = (players) => ({
  type: APP_PLAYERS_SYNC,
  players
});

export const setCurrentPlayer = (player) => ({
  type: APP_SET_PLAYER,
  player
});

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
