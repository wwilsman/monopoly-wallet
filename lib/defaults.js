export const gameDefaults = {
  players: [],
  properties: [],
  pollTimeout: 30000,
  auctionTimeout: 30000
}

export const playerDefaults = {
  name: '',
  token: '',
  balance: '',
  isBankrupt: false
}

export const propertyDefaults = {
  name: '',
  group: '',
  price: 0,
  build: 0,
  rent: [0, 0, 0, 0, 0, 0],
  mortgage: 0,
  interest: 0,
  buildings: 0,
  isMortgaged: false,
  owner: 'bank'
}
