import {
  AUCTION_PROPERTY,
  PLACE_BID,
  CONCEDE_AUCTION,
  CANCEL_AUCTION
} from '../actions/auction';

/**
 * Auction reducer
 * @param {Object|Boolean} state - Auction state
 * @param {Object} action - Redux action
 * @returns {Object|Boolean} Reduced state
 */
export default (state = false, action) => {
  switch (action.type) {
    case AUCTION_PROPERTY:
      return {
        property: action.property.id,
        players: action.players,
        winning: false,
        amount: 0
      };

    case PLACE_BID:
      return { ...state,
        winning: action.player.token,
        amount: action.amount
      };

    case CONCEDE_AUCTION:
      return { ...state,
        players: state.players.filter((token) => (
          token !== action.player.token
        ))
      };

    case CANCEL_AUCTION:
      return false;

    default:
      return state;
  }
};
