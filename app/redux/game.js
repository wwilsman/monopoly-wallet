import { emit } from './socket';

// action creators
export const newGame = emit.bind(null, 'game:new');
export const connectToGame = emit.bind(null, 'room:connect');
export const disconnectGame = emit.bind(null, 'room:disconnect');
export const joinGame = emit.bind(null, 'game:join');
