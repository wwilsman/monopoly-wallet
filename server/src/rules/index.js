import {
  JOIN_GAME,
  MAKE_TRANSFER_TO,
  MAKE_TRANSFER_FROM,
  MAKE_TRANSFER_WITH,
  CLAIM_BANKRUPTCY
} from '../actions/players';
import {
  BUY_PROPERTY,
  IMPROVE_PROPERTY,
  UNIMPROVE_PROPERTY,
  UNIMPROVE_GROUP,
  MORTGAGE_PROPERTY,
  UNMORTGAGE_PROPERTY,
  PAY_RENT
} from '../actions/properties';
import {
  AUCTION_PROPERTY,
  PLACE_BID,
  CONCEDE_AUCTION,
  CLOSE_AUCTION,
  CANCEL_AUCTION
} from '../actions/auction';
import {
  MAKE_OFFER,
  DECLINE_OFFER,
  ACCEPT_OFFER
} from '../actions/trades';

import {
  bankHasFunds,
  negativeAmount
} from './common';
import {
  allowedToken,
  uniqueToken,
  playerExists,
  sufficientBalance,
  otherSufficientBalance,
} from './players';
import {
  propertyIsOwned,
  propertyNotOwned,
  propertyOwnedBy,
  propertiesOwnedBy,
  notRailroadOrUtility,
  propertyIsMonopoly,
  propertyIsMortgaged,
  propertiesAreMortgaged,
  propertyNotMortgaged,
  propertiesNotMortgaged,
  propertyIsImproved,
  propertiesAreImproved,
  propertyNotImproved,
  propertiesNotImproved,
  propertyNotFullyImproved,
  monopolyNotImproved,
  mustImproveEvenly,
  mustUnimproveEvenly,
  enoughHousesOrHotels
} from './properties';
import {
  noCurrentAuction,
  auctionInProgress,
  notWinningAuction,
  propertyNotForAuction,
  playerInAuction,
  bidHigherThan
} from './auction';
import {
  tradeExists,
  tradeIsWith
} from './trades';

// Player rule definitions
const PLAYERS = {
  [JOIN_GAME]: [
    allowedToken,
    uniqueToken,
    bankHasFunds
  ],
  [MAKE_TRANSFER_TO]: [
    playerExists,
    bankHasFunds
  ],
  [MAKE_TRANSFER_FROM]: [
    playerExists,
    sufficientBalance
  ],
  [MAKE_TRANSFER_WITH]: [
    playerExists,
    negativeAmount,
    sufficientBalance
  ],
  [CLAIM_BANKRUPTCY]: [
    playerExists,
    propertiesNotImproved,
    propertiesAreMortgaged
  ]
};

// Property rule definitions
const PROPERTIES = {
  [BUY_PROPERTY]: [
    playerExists,
    negativeAmount,
    propertyNotOwned,
    propertyNotForAuction,
    sufficientBalance
  ],
  [IMPROVE_PROPERTY]: [
    playerExists,
    propertyOwnedBy,
    notRailroadOrUtility,
    propertyIsMonopoly,
    propertiesNotMortgaged,
    propertyNotFullyImproved,
    mustImproveEvenly,
    enoughHousesOrHotels,
    sufficientBalance
  ],
  [UNIMPROVE_PROPERTY]: [
    playerExists,
    propertyOwnedBy,
    notRailroadOrUtility,
    propertyIsImproved,
    mustUnimproveEvenly,
    enoughHousesOrHotels,
    bankHasFunds
  ],
  [UNIMPROVE_GROUP]: [
    playerExists,
    propertiesOwnedBy,
    notRailroadOrUtility,
    propertiesAreImproved,
    bankHasFunds
  ],
  [MORTGAGE_PROPERTY]: [
    playerExists,
    propertyOwnedBy,
    propertyNotMortgaged,
    propertyNotImproved,
    monopolyNotImproved,
    bankHasFunds
  ],
  [UNMORTGAGE_PROPERTY]: [
    playerExists,
    propertyOwnedBy,
    propertyIsMortgaged,
    sufficientBalance
  ],
  [PAY_RENT]: [
    playerExists,
    propertyIsOwned,
    propertyNotMortgaged,
    sufficientBalance
  ]
};

// Auction rule definitions
const AUCTIONS = {
  [AUCTION_PROPERTY]: [
    noCurrentAuction,
    propertyNotOwned
  ],
  [PLACE_BID]: [
    auctionInProgress,
    playerInAuction,
    notWinningAuction,
    bidHigherThan,
    sufficientBalance
  ],
  [CONCEDE_AUCTION]: [
    auctionInProgress,
    notWinningAuction
  ],
  [CLOSE_AUCTION]: [
    auctionInProgress,
    sufficientBalance
  ],
  [CANCEL_AUCTION]: [
    auctionInProgress
  ]
};

// Trade rule definitions
const TRADES = {
  [MAKE_OFFER]: [
    playerExists,
    propertiesOwnedBy,
    sufficientBalance
  ],
  [DECLINE_OFFER]: [
    playerExists,
    tradeExists
  ],
  [ACCEPT_OFFER]: [
    playerExists,
    tradeExists,
    tradeIsWith,
    propertiesOwnedBy,
    sufficientBalance,
    otherSufficientBalance
  ]
};

// All rule definitions
export default {
  ...PLAYERS,
  ...PROPERTIES,
  ...AUCTIONS,
  ...TRADES
};