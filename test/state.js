import config from '../public/themes/classic/config.json'
import properties from '../public/themes/classic/properties.json'

// initial state
const state = {
  ...config,
  properties,

  bank: config.start,
  passGo: config.start * 2/3,
  players: [],
  houses: 4,
  hotels: 1
}

// Player 1
state.players.push({
  _id: 'player-1',
  name: 'Player 1',
  token: config.tokens[0],
  balance: config.start
})

// Player 1 owns the first monopoly with a hotel
let property1 = state.properties[0]

state.properties.forEach((p, i) => {
  if (p.group === property1.group) {
    p.buildings = i === 0 ? 5 : 4
    p.owner = 'player-1'
  }
})

// Player 2
state.players.push({
  _id: 'player-2',
  name: 'Player 2',
  token: config.tokens[1],
  balance: config.start
})

// Player 2 owns the second monopoly without any improvements
let property2 = state.properties.find((p) => !p.owner)

state.properties.forEach((p, i) => {
  if (p.group === property2.group) {
    p.owner = 'player-2'
  }
})

// Player 3
state.players.push({
  _id: 'player-3',
  name: 'Player 3',
  token: config.tokens[2],
  balance: config.start
})

// Player 3 owns a property, 2 railroads, and a utility
let property3 = state.properties.find((p) => !p.owner)
property3.owner = 'player-3'
property3.isMortgaged = true

state.properties.find((p) => p.group === 'utility').owner = 'player-3'
state.properties.filter((p) => p.group === 'railroad').forEach((p, i) => {
  if (i < 2) p.owner = 'player-3'
})

// export
export default state
