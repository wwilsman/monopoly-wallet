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
  MAKE_OFFER
} from '../actions/trades';

import {
  bankHasFunds,
  negativeAmount
} from './common';
import {
  uniqueToken,
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

// Player rule definitions
const PLAYERS = {
  [JOIN_GAME]: [
    uniqueToken,
    bankHasFunds
  ],
  [MAKE_TRANSFER_TO]: [
    bankHasFunds
  ],
  [MAKE_TRANSFER_FROM]: [
    sufficientBalance
  ],
  [MAKE_TRANSFER_WITH]: [
    negativeAmount,
    sufficientBalance
  ],
  [CLAIM_BANKRUPTCY]: [
    propertiesNotImproved,
    propertiesAreMortgaged
  ]
};

// Property rule definitions
const PROPERTIES = {
  [BUY_PROPERTY]: [
    negativeAmount,
    propertyNotOwned,
    sufficientBalance
  ],
  [IMPROVE_PROPERTY]: [
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
    propertyOwnedBy,
    notRailroadOrUtility,
    propertyIsImproved,
    mustUnimproveEvenly,
    enoughHousesOrHotels,
    bankHasFunds
  ],
  [MORTGAGE_PROPERTY]: [
    propertyOwnedBy,
    propertyNotMortgaged,
    propertyNotImproved,
    monopolyNotImproved,
    bankHasFunds
  ],
  [UNMORTGAGE_PROPERTY]: [
    propertyOwnedBy,
    propertyIsMortgaged,
    sufficientBalance
  ],
  [PAY_RENT]: [
    propertyIsOwned,
    sufficientBalance
  ]
};

// Trade rule definitions
const TRADES = {
  [MAKE_OFFER]: [
    propertiesOwnedBy,
    sufficientBalance
  ]
};

// All rule definitions
export default {
  ...PLAYERS,
  ...PROPERTIES,
  ...TRADES
};
