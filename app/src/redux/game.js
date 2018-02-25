import { event, emit } from './socket';

// action creators
export const newGame = emit.bind(null, 'game:new');
export const connectToGame = emit.bind(null, 'room:connect');
export const disconnectGame = emit.bind(null, 'room:disconnect');
export const joinGame = emit.bind(null, 'game:join');

// game reducer (there is no initial game state)
export const reducer = (state = null, action) => {
  switch (action.type) {
    case event('room:disconnect'):
      return null;

    default:
      if (action.game) {
        return { ...(state || {}), ...action.game };
      } else {
        return state;
      }
  }
};
