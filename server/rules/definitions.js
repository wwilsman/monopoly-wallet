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
  MORTGAGE_PROPERTY,
  UNMORTGAGE_PROPERTY,
  PAY_RENT
} from '../actions/properties';
import {
  MAKE_OFFER,
  DECLINE_OFFER
} from '../actions/trades';

import {
  bankHasFunds,
  negativeAmount
} from './common';
import {
  uniqueToken,
  playerExists,
  sufficientBalance
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
  propertyIsImproved,
  propertyNotImproved,
  propertiesNotImproved,
  propertyNotFullyImproved,
  monopolyNotImproved,
  mustImproveEvenly,
  mustUnimproveEvenly,
  enoughHousesOrHotels
} from './properties';
import {
  tradeExists
} from './trades';

// Player rule definitions
const PLAYERS = {
  [JOIN_GAME]: [
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
    sufficientBalance
  ],
  [IMPROVE_PROPERTY]: [
    playerExists,
    propertyOwnedBy,
    notRailroadOrUtility,
    propertyIsMonopoly,
    propertyNotMortgaged,
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
    sufficientBalance
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
  ]
};

// All rule definitions
export default {
  ...PLAYERS,
  ...PROPERTIES,
  ...TRADES
};
