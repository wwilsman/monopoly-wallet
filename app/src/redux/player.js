import { emit } from './socket';

// action creators
export const makeTransfer = emit.bind(null, 'player:transfer');
