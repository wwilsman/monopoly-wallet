import { randomString } from './helpers'

const initialState = {
  players: [],
  properties: [],
  trades: []
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'JOIN_GAME':
      return {
        ...state,
        players: [...state.players, {
          balance: 0,
          isBankrupt: false,
          ...action.player
        }]
      }

    case 'BANK_TRANSFER':
      return {
        ...state,
        bank: state.bank + action.amount,
        players: state.players.map((p) => {
          if (p.token === action.player) {
            return {...p, balance: p.balance - action.amount }
          }

          return p
        })
      }

    case 'TRANSFER_MONEY':
      return {
        ...state,
        players: state.players.map((p) => {
          if (p.token === action.fromPlayer) {
            return { ...p, balance: p.balance - action.amount }
          } else if (p.token === action.toPlayer) {
            return { ...p, balance: p.balance + action.amount }
          }

          return p
        })
      }
    case 'TRANSFER_PROPERTY':
      return {
        ...state,
        properties: state.properties.map((p) => {
          if (p.name === action.property) {
            return { ...p, owner: action.toPlayer }
          }

          return p
        })
      }

    case 'AUCTION_PROPERTY':
      return {
        ...state,
        auction: {
          property: action.property,
          bids: action.players.map((player) => {
            return { player, amount: 0 }
          })
        }
      }
    case 'PLACE_AUCTION_BID':
      return {
        ...state,
        auction: {
          ...state.auction,
          bids: state.auction.bids.map((b) => {
            if (b.player === action.player) {
              return { ...b, amount: action.amount }
            }

            return b
          }).sort((a, b) => b.amount - a.amount)
        }
      }
    case 'CONCEDED_AUCTION':
      const bids = state.auction.bids
      const i = bids.findIndex((b) => b.player === action.player)
      
      return {
        ...state,
        auction: {
          ...state.auction,
          bids: [...bids.slice(0, i), ...bids.slice(i + 1)]
        }
      }
    case 'END_AUCTION':
      return {
        ...state,
        auction: false
      }

    case 'BUILD_PROPERTY':
      let buildings = action.hotels + Math.min(action.houses, 0)
      buildings = buildings || action.houses

      return {
        ...state,
        houses: state.houses - action.houses,
        hotels: state.hotels - action.hotels,
        properties: state.properties.map((p) => {
          if (p.name === action.property) {
            return { ...p, buildings: p.buildings + buildings }
          }

          return p
        })
      }
    case 'MORTGAGE_PROPERTY':
      return {
        ...state,
        properties: state.properties.map((p) => {
          if (p.name === action.property) {
            return { ...p, isMortgaged: !action.unmortgage }
          }

          return p
        })
      }

    case 'MAKE_TRADE':
      return {
        ...state,
        trades: [...state.trades, action.trade]
      }
    case 'MODIFY_TRADE':
      return {
        ...state,
        trades: [
          ...state.trades.slice(0, action.index),
          action.trade,
          ...state.trades.slice(action.index + 1)
        ]
      }
    case 'DELETE_TRADE':
      return {
        ...state,
        trades: [
          ...state.trades.slice(0, action.index),
          ...state.trades.slice(action.index + 1),
        ]
      }

    case 'BANKRUPT_PLAYER':
      return {
        ...state,
        players: state.players.map((p) => {
          if (p.token === action.player) {
            return { ...p, isBankrupt: true }
          }

          return p
        })
      }

    case 'SAVE_STATE':
      return { ...state,
        entry: randomString(10),
        notice: action.note ? {
          type: action.saveType,
          message: action.note,
          blame: action.blame
        } : false
      }

    default:
      return state
  }
}
