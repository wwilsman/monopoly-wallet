import { throwError } from './error';

/**
 * Validates an auction is not currently active
 * @param {Object} auction - Current active auction
 * @throws {MonopolyError}
 */
export const noCurrentAuction = ({ auction }) => {
  auction && throwError('Auction in progress');
};
