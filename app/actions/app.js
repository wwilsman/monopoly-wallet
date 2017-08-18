export const APP_ERROR = 'APP_ERROR';
export const APP_LOADING_DONE = 'APP_LOADING_DONE';
export const APP_PLAYERS_SYNC = 'APP_PLAYERS_SYNC';
export const APP_SET_PLAYER = 'APP_SET_PLAYER';

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
