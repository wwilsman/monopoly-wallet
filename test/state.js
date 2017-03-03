import theme from '../public/themes/classic/config.json'
import properties from '../public/themes/classic/properties.json'
import { createState } from '../lib/game'

const tokens = theme.playerTokens

// config
const config = {
  ...theme,
  theme: 'classic',
  bankStart: theme.playerStart,
  houseCount: 4,
  hotelCount: 1
}

// initial state
let state = createState(config, properties)

// Player 1
state.players.push({
  name: 'player 1',
  token: tokens[0],
  balance: config.playerStart
})

// Player 1 owns the first monopoly with a hotel
let property1 = state.properties[0]

state.properties.forEach((p, i) => {
  if (p.group === property1.group) {
    p.buildings = i === 0 ? 5 : 4
    p.owner = tokens[0]
  }
})

// Player 2
state.players.push({
  name: 'player 2',
  token: tokens[1],
  balance: config.playerStart
})

// Player 2 owns the second monopoly without any improvements
let property2 = state.properties.find((p) => p.owner === 'bank')

state.properties.forEach((p, i) => {
  if (p.group === property2.group) {
    p.owner = tokens[1]
  }
})

// Player 3
state.players.push({
  name: 'player 3',
  token: tokens[2],
  balance: config.playerStart
})

// Player 3 owns a property, 2 railroads, and a utility
let property3 = state.properties.find((p) => p.owner === 'bank')
property3.owner = tokens[2]
property3.isMortgaged = true

state.properties.find((p) => p.group === 'utility').owner = tokens[2]
state.properties.filter((p) => p.group === 'railroad').forEach((p, i) => {
  if (i < 2) p.owner = tokens[2]
})

// export
export default { config, state }
