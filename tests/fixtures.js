// TODO: Build this fixture from real defaults using the `createState` function
// from `server/game`. Likewise use a real default configuration.

const GAME = {
  id: 'T35TT',
  bank: 10000,
  players: [],
  properties: [{
    id: 'oriental-avenue',
    name: 'Oriental Avenue',
    group: 'light-blue',
    rent: [6, 30, 90, 270, 400, 550],
    buildings: 0,
    price: 100,
    cost: 50,
    owner: 'bank'
  }]
};

const CONFIG = {
  playerStart: 1500
};

export default {
  GAME,
  CONFIG
};
