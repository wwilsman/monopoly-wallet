import { randomString } from './helpers'

export default (state = {}, action) => {
  switch (action.type) {
    case 'JOIN_GAME':
      return { ...state,
        players: [ ...state.players, { ...action.player } ]
      }

    case 'BANK_TRANSFER':
      return { ...state,
        bank: state.bank + action.amount,
        players: state.players.map((p) => p._id !== action.player ? p :
          { ...p, balance: p.balance - action.amount })
      }

    case 'TRANSFER_MONEY':
      return { ...state,
        players: state.players.map((p) =>
          p._id === action.fromPlayer ? { ...p, balance: p.balance - action.amount } :
          p._id === action.toPlayer ? { ...p, balance: p.balance + action.amount } : p
        )
      }
    case 'TRANSFER_PROPERTY':
      return { ...state,
        properties: state.properties.map((p) => p._id !== action.property ? p :
          { ...p, owner: action.toPlayer })
      }

    case 'BUILD_PROPERTY':
      let buildings = action.hotels + Math.min(action.houses, 0)

      return { ...state,
        houses: state.houses - action.houses,
        hotels: state.hotels - action.hotels,
        properties: state.properties.map((p) => p._id !== action.property ? p :
          { ...p, buildings: p.buildings + (buildings || action.houses) })
      }
    case 'MORTGAGE_PROPERTY':
      return { ...state,
        properties: state.properties.map((p) => p._id !== action.property ? p :
          { ...p, isMortgaged: !action.unmortgage })
      }

    case 'BANKRUPT_PLAYER':
      return { ...state,
        players: state.players.map((p) => p._id !== action.player ? p :
          { ...p, isBankrupt: true })
      }

    case 'SAVE_STATE':
      return { ...state,
        entry: `${state._id}-${randomString(10)}`,
        note: action.message
      }

    default:
      return state
  }
}
