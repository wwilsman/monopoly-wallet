import { dasherize, uniqueValue } from './helpers'

export const defaultState = {
  bank: 0,
  start: 0,
  houses: 0,
  hotels: 0,
  mortgageRate: 0,
  interestRate: 0,
  buildingRate: 0,
  tokens: [],
  players: [],
  properties: [],
  pollTimeout: 30000,
  auctionTimeout: 30000
}

export function playerDefaults({
  _id = '',
  name = '',
  token = '',
  balance = '',
  isBankrupt = false,
  isActive = false
}, i, arr) {
  return {
    _id: _id || uniqueValue('_id', dasherize(name), arr),
    name,
    token,
    balance
  }
}

export function propertyDefaults({
  _id = '',
  name = '',
  group = '',
  price = 0,
  cost = 0,
  rent = [0, 0, 0, 0, 0, 0],
  buildings = 0,
  isMortgaged = false,
  owner = 'bank'
}, i, arr) {
  return {
    _id: _id || uniqueValue('_id', dasherize(name), arr),
    name,
    group,
    price,
    cost,
    rent,
    buildings,
    isMortgaged,
    owner
  }
}
