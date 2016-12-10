export const gameDefaults = {
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

export const playerDefaults = {
  name: '',
  token: '',
  balance: '',
  isBankrupt: false,
  isActive: false
}

export const propertyDefaults = {
  name: '',
  group: '',
  price: 0,
  cost: 0,
  rent: [0, 0, 0, 0, 0, 0],
  buildings: 0,
  isMortgaged: false,
  owner: 'bank'
}
