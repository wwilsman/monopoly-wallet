import { assert, dasherize, uniqueValue } from './helpers'
import { createStore } from 'redux'
import reducer from './reducer'
import * as actions from './actions'

import undoable, {
  includeAction,
  ActionCreators as undoActions,
} from 'redux-undo'

/** 
 * Creates a new state object from config and property objects 
 *
 * @param {object} config
 * @param {object[]} properties
 */
export function createState(config, properties) {
  return {
    bank: config.bankStart === -1 ? Infinity : config.bankStart,
    houses: config.houseCount,
    hotels: config.hotelCount,
    auction: false,
    players: [],
    trades: [],

    properties: properties.map((property) => {
      const mortgage = Math.round(property.price * config.mortgageRate)
      const interest = Math.round(mortgage * config.interestRate)
      const sell = Math.round(property.build * config.buildingRate)

      return {
        mortgage,
        sell,
        interest,
        buildings: 0,
        isMortgaged: false,
        owner: 'bank',
        ...property,
      }
    })
  }
}

/**
 * The Game Class
 */
export default class MonopolyGame {

  /** 
   * @constructor
   * @param {object} config
   * @param {object} state
   */
  constructor(config, state = { properties: [] }) {
    this.config = config

    // initial state
    this.state = !isNaN(state.bank) ? state : createState(config, state.properties)

    // store
    this.store = createStore(undoable(reducer, {
      filter: includeAction('ADD_HISTORY')
    }), { past: [], present: this.state, future: [] })

    // subscribers
    const subscribers = []

    this.subscribe = (fn) => {
      subscribers.push(fn)
    }

    this.update = (type, note, blame) => {
      this.store.dispatch(actions.saveState(type, note, blame))

      if (type === 'game' || type === 'auction:end') {
        this.store.dispatch({ type: 'ADD_HISTORY' })
      }
      
      subscribers.forEach((fn) => fn())
    }

    // update state
    this.store.subscribe(() => {
      const { present } = this.store.getState()
      this.state = present
    })

    // first history entry
    this.store.dispatch(actions.saveState('init'))
    this.store.dispatch({ type: 'ADD_HISTORY' })
  }

  /**
   * Adds a new player to the state; deducting their start balance from the bank
   *
   * @param {string} name
   * @param {string} [token]
   */
  join(name = '', token) {
    const { playerStart } = this.config
    const { players, bank } = this.state
    name = name.toLowerCase()

    if (!token) {
      // first available token
      token = this.config.playerTokens.find((t) =>
        !players.find((p) => p.token === t))
    }

    assert('Token already taken', players.find((p) => p.token === token))
    assert('Bank funds are insufficient', bank - playerStart < 0)

    this.store.dispatch(actions.joinGame(name, token))
    this.store.dispatch(actions.bankTransfer(token, -playerStart))

    this.update('game', `{p:${token}} joined the game`, [token])
  }

  /** 
   * Retrieve a player by their token
   *
   * @param {string} token
   */
  getPlayer(token) {
    const player = this.state.players.find((p) => p.token === token)
    assert('Player not found', !player)
    return player
  }

  /** 
   * Retrieve a property by its name
   *
   * @param {string} name
   */
  getProperty(name) {
    const property = this.state.properties.find((p) => p.name === name)
    assert('Property not found', !property)
    return property
  }

  /**
   * Retrive all the properties in a group
   *
   * @param {string} groupName
   */
  getPropertyGroup(groupName) {
    const group = this.state.properties.filter((p) => p.group === groupName)
    assert('Group not found', !group.length)
    return group
  }

  /**
   * Undoes an entry in the state history
   *
   * @param {string} entryID
   */
  undo(entryID) {
    const { past, present } = this.store.getState()
    const index = present.entry === entryID ? past.length - 1 :
                  past.findIndex((s) => s.entry === entryID)

    assert('Cannot find entry in history', index < 0)

    this.store.dispatch(undoActions.jumpToPast(index - 1))

    this.update('game', `Game reset to before ${past[index].notice.message}`)
  }

  /**
   * Transfers an amount to the bank
   *
   * @param {string} token
   * @param {number} amount
   */
  payBank(token, amount) {
    const player = this.getPlayer(token)

    assert('Cannot pay negative amounts', amount < 0)
    assert('Insufficient funds', player.balance - amount < 0)

    this.store.dispatch(actions.bankTransfer(token, amount))

    this.update('game', `{p:${token}} paid the bank {$:${amount}}`, [token])
  }

  /**
   * Transfers money from the bank
   *
   * @param {string} token
   * @param {number} amount
   */
  collectMoney(token, amount) {
    const { bank } = this.state
    const player = this.getPlayer(token)

    assert('Cannot collect negative amounts', amount < 0)
    assert('Bank funds are insufficient', bank - amount < 0)

    this.store.dispatch(actions.bankTransfer(token, -amount))

    this.update('game', `{p:${token}} collected {$:${amount}}`, [token])
  }

  /**
   * Transfers an amount to another player
   *
   * @param {string} fromToken
   * @param {string} toToken
   * @param {number} amount
   */
  payPlayer(fromToken, toToken, amount) {
    const fromPlayer = this.getPlayer(fromToken)
    const toPlayer = this.getPlayer(toToken)

    assert('Cannot pay negative amounts', amount < 0)
    assert('Insufficient funds', fromPlayer.balance - amount < 0)

    this.store.dispatch(actions.transferMoney(fromToken, toToken, amount))

    this.update('game', `{p:${fromToken}} paid {p:${toToken}} {$:${amount}}`, [fromToken, toToken])
  }
  
  /**
   * Transfers rent costs from a player to a property's owner
   *
   * @param {string} token
   * @param {string} propertyName
   * @param {number} roll
   */
  payRent(token, propertyName, roll = 2) {
    const { properties } = this.state
    const player = this.getPlayer(token)
    const property = this.getProperty(propertyName)
    const owner = this.getPlayer(property.owner)

    const group = this.getPropertyGroup(property.group)
    const owned = group.filter((p) => p.owner === property.owner)

    let rent
    switch (property.group) {
      case 'utility':
        rent = property.rent[owned.length - 1] * roll
        break
      case 'railroad':
        rent = property.rent[owned.length - 1]
        break
      default:
        rent = property.rent[property.buildings]

        if (property.buildings === 0) {
          rent *= (owned.length === group.length ? 2 : 1)
        }
    }

    assert(`${propertyName} is unowned`, property.owner === 'bank')
    assert(`${propertyName} has been mortgaged`, property.isMortgaged)
    assert('You own this property', property.owner === token)
    assert('Insufficient funds', player.balance - rent < 0)

    this.store.dispatch(actions.transferMoney(token, property.owner, rent))

    this.update('game', `{p:${token}} paid {$:${rent}} in rent for ${propertyName}`, [token, owner])
  }

  /**
   * Bankrupt a player and give their assets to a beneficiary
   * unimproving properties when necessary
   *
   * @param {string} token
   * @param {string} beneficiaryToken
   */
  claimBankruptcy(token, beneficiaryToken) {
    const player = this.getPlayer(token)
    const properties = this.state.properties.filter((p) => p.owner === token)

    const value = Math.min(properties.reduce((v, p) => {
      return v + (p.buildings * (p.build * this.config.buildingRate))
    }, 0), this.state.bank)

    properties.forEach((p) => {
      const needsHouses = p.buildings === 5
      const hotels = needsHouses ? -1 : 0
      const houses = needsHouses ? -4 : -p.buildings

      this.store.dispatch(actions.buildProperty(p.name, houses, hotels))
      this.store.dispatch(actions.transferProperty(beneficiaryToken, p.name))
    })

    if (beneficiaryToken === 'bank') {
      this.store.dispatch(actions.bankTransfer(token, player.balance))
    } else {
      this.store.dispatch(actions.bankTransfer(token, -value))
      this.store.dispatch(actions.transferMoney(token, beneficiaryToken, value + player.balance))
    }

    this.store.dispatch(actions.bankruptPlayer(token))

    this.update('game', `{p:${beneficiaryToken}} bankrupt {p:${token}}`, [token, beneficiaryToken])
  }

  /**
   * Transfers a property from the bank and it's price from the player
   *
   * @param {string} token
   * @param {string} propertyName
   * @param {number} [price]
   */
  buyProperty(token, propertyName, price) {
    const { auction } = this.state
    const player = this.getPlayer(token)
    const property = this.getProperty(propertyName)

    if (typeof price === 'undefined') {
      price = property.price
    }

    assert(`You already own ${propertyName}`, property.owner === token)
    assert(`${propertyName} is already owned`, property.owner !== 'bank')
    assert(`${propertyName} is being auctioned`, auction && auction.property === propertyName)
    assert('Insufficient funds', player.balance - price < 0)

    this.store.dispatch(actions.bankTransfer(token, price))
    this.store.dispatch(actions.transferProperty(token, propertyName))

    this.update('game', `{p:${token}} purchased ${propertyName}`, [token])
  }

  /**
   * Adds a building from a property; adds/removes available houses/hotels.
   * Transfers the build cost to the bank
   *
   * @param {string} token
   * @param {string} propertyName
   */
  improveProperty(token, propertyName) {
    const {
      properties,
      houses:availHouses,
      hotels:availHotels
    } = this.state
    
    const player = this.getPlayer(token)
    const property = this.getProperty(propertyName)
    const group = this.getPropertyGroup(property.group)
    
    const needsHotel = property.buildings === 4
    const houses = needsHotel ? -4 : 1
    const hotels = needsHotel ? 1 : 0

    assert(`You do not own ${propertyName}`, property.owner !== token)
    assert('You cannot improve a railroad', property.group === 'railroad')
    assert('You cannot improve a utility', property.group === 'utility')
    assert('Must be a monopoly', !group.every((p) => p.owner === token))
    assert('Cannot improve a mortgaged property', property.isMortgaged)
    assert('Must build evenly', group.some((p) => p.buildings < property.buildings))
    assert(`${propertyName} is already fully improved`, property.buildings === 5)
    assert('Not enough houses', !needsHotel && availHouses === 0)
    assert('Not enough hotels', needsHotel && availHotels === 0)
    assert('Insufficient funds', player.balance - property.build < 0)

    this.store.dispatch(actions.bankTransfer(token, property.build))
    this.store.dispatch(actions.buildProperty(propertyName, houses, hotels))

    this.update('game', `{p:${token}} improved ${propertyName}`, [token])
  }

  /**
   * Removes a building from a property; adds/removes available houses/hotels.
   * Transfers the sell value from the bank
   *
   * @param {string} token
   * @param {string} propertyName
   * @param {boolean} doMin - do across group if no available houses/hotels
   */
  unimproveProperty(token, propertyName, doMin) {
    const { buildingRate } = this.config
    const { bank, properties, houses:availHouses } = this.state
    const player = this.getPlayer(token)
    const property = this.getProperty(propertyName)
    const group = this.getPropertyGroup(property.group)
    
    const needsHouses = property.buildings === 5
    const houses = needsHouses ? 4 : -1
    const hotels = needsHouses ? -1 : 0

    let value = Math.round(property.build * buildingRate)
    doMin = !!doMin && needsHouses && availHouses < 4

    if (doMin) {
      // gather total values
      const h = group.filter((p) => p.buildings === 5).length
      value = value * (((houses * h) + h) - availHouses)
    }

    assert(`You do not own ${propertyName}`, property.owner !== token)
    assert('You cannot unimprove a railroad', property.group === 'railroad')
    assert('You cannot unimprove a utility', property.group === 'utility')
    assert(`${propertyName} is already fully unimproved`, property.buildings === 0)
    assert('Must build evenly', group.some((p) => p.buildings > property.buildings))
    assert('Not enough houses', !doMin && needsHouses && availHouses < 4)
    assert('Bank funds are insufficient', bank - value < 0)

    this.store.dispatch(actions.bankTransfer(token, -value))
    this.store.dispatch(actions.buildProperty(propertyName, houses, hotels))

    if (doMin) {
      // do across group until available houses is positive
      // use state here since it's being updated
      while (this.state.houses < 0) {
        // sort the group by profitability
        group.sort((a, b) => a.rent[5] - b.rent[5]).forEach((p) => {
          p = this.getProperty(p.name) // get an updated reference

          // double check the state for this inner loop
          if (this.state.houses < 0 && p.buildings) {
            const needsHouses = p.buildings === 5
            const houses = needsHouses ? 4 : -1
            const hotels = needsHouses ? -1 : 0

            this.store.dispatch(actions.buildProperty(p.name, houses, hotels))
          }
        })
      }
    }

    this.update('game', `{p:${token}} unimproved ${propertyName}`, [token])
  }

  /**
   * Mortgage a property and transfer the mortgage value from the bank
   *
   * @param {string} token
   * @param {string} propertyName
   */
  mortgageProperty(token, propertyName) {
    const { bank } = this.state
    const player = this.getPlayer(token)
    const property = this.getProperty(propertyName)

    assert(`You do not own ${property.name}`, property.owner !== token)
    assert(`${property.name} is already mortgaged`, property.isMortgaged)
    assert(`${property.name} still has improvements`, property.buildings > 0)
    assert('Bank funds are insufficient', bank - property.mortgage < 0)

    this.store.dispatch(actions.bankTransfer(token, -property.mortgage))
    this.store.dispatch(actions.mortgageProperty(propertyName))

    this.update('game', `{p:${token}} mortaged ${propertyName}`, [token])
  }

  /**
   * Mortgage a property and transfer the mortgage value from the bank
   *
   * @param {string} token
   * @param {string} propertyName
   */
  unmortgageProperty(token, propertyName, noInterest) {
    const player = this.getPlayer(token)
    const property = this.getProperty(propertyName)

    const cost = noInterest ? property.mortgage : property.mortgage + property.interest

    assert(`You do not own ${property.name}`, property.owner !== token)
    assert(`${property.name} is not mortgaged`, !property.isMortgaged)
    assert('Insufficient funds', player.balance - cost < 0)

    this.store.dispatch(actions.bankTransfer(token, cost))
    this.store.dispatch(actions.mortgageProperty(propertyName, true))

    this.update('game', `{p:${token}} unmortaged ${propertyName}`, [token])
  }

  /**
   * Place a property for auction
   *
   * @param {string} token
   * @param {string} propertyName
   * @param {string[]} participants
   */
  auctionProperty(token, propertyName, participants) {
    const property = this.getProperty(propertyName)

    assert('There is already an active auction', this.state.auction)
    assert('Cannot auction player properties', property.owner !== 'bank')

    this.store.dispatch(actions.startAuction(propertyName, participants))

    this.update('auction:new', `${propertyName} is up for auction.`, [token])
  }

  /**
   * Bid on an auctioned property
   *
   * @param {string} token
   * @param {string} propertyName
   */
  placeAuctionBid(token, propertyName, amount) {
    const { auction } = this.state
    const player = this.getPlayer(token)
    const winning = auction && auction.bids[0]

    assert(`${propertyName} is not up for auction`, !auction || auction.property !== propertyName)
    assert('You\'ve conceded from this auction', !auction.bids.find((b) => b.player === token))
    assert('You\'re already winning this auction', winning.player === token && winning.amount > 0)
    assert(`You need to bid higher than {p:${auction.winning}}`, winning.amount >= amount)
    assert('Insufficient funds', player.balance < amount)

    this.store.dispatch(actions.placeAuctionBid(token, amount))

    this.update('auction:bid', `{p:${token}} bid {$:${amount}} on ${propertyName}`, [token])

    // last player to bid
    if (this.state.auction.bids.length === 1) {
      this._closeAuction()
    }
  }

  /**
   * Concede from an auction
   *
   * @param {string} token
   * @param {string} propertyName
   */
  concedeAuction(token, propertyName) {
    const { auction } = this.state
    
    assert(`${propertyName} is not up for auction`, !auction || auction.property !== propertyName)
    assert('You already conceded from this auction', !auction.bids.find((b) => b.player === token))

    this.store.dispatch(actions.concedeAuction(token))

    this.update('auction:concede', `{p:${token}} conceded from the auction`, [token])

    // get updated bids
    const { bids }= this.state.auction

    // last to concede or one player left with bid
    if (bids.length < 1 || (bids.length === 1 && bids[0].amount > 0)) {
      this._closeAuction()
    }
  }

  /**
   * Close an auction and maybe announce a winner
   * @private
   */
  _closeAuction() {
    const { auction } = this.state
    const winning = auction && auction.bids[0]

    this.store.dispatch(actions.endAuction())

    if (winning && winning.amount > 0) {
      this.store.dispatch(actions.bankTransfer(winning.player, winning.amount))
      this.store.dispatch(actions.transferProperty(winning.player, auction.property))

      this.update(
        'auction:end',
        `{p:${winning.player}} bought ${auction.property} for {$:${winning.amount}}`,
        [winning.player]
      )
    } else if (auction) {
      this.update('auction', `${auction.property} auction cancelled`)
    }
  }
  
  /**  
   * Validates trade info
   * @private
   */
  _validateTrade(trade) {
    const player1 = this.getPlayer(trade.players[0])
    const player2 = this.getPlayer(trade.players[1])
    
    const trade1 = trade[player1.token]
    const trade2 = trade[player2.token]
    
    const amount1 = trade1.amount || 0
    const amount2 = trade2.amount || 0

    const properties1 = (trade1.properties || []).map(this.getProperty, this)
    const properties2 = (trade2.properties || []).map(this.getProperty, this)

    const addPropertyInterest = (i, p) => p.isMortgaged ? i + p.interest : i
    const interest1 = properties1.reduce(addPropertyInterest, 0)
    const interest2 = properties2.reduce(addPropertyInterest, 0)

    const unowned1 = properties1.find((p) => p.owner !== player1.token)
    const unowned2 = properties2.find((p) => p.owner !== player2.token)
    const improved = properties1.find((p) => p.buildings) || properties2.find((p) => p.buildings)
    
    assert(`Insufficient funds`, player1.balance - amount1 - interest2 < 0)
    assert(`{p:${player2.token}} has insufficient funds`, player2.balance - amount2 - interest1 < 0)
    assert(`You do not own ${unowned1 && unowned1.name}`, unowned1)
    assert(`${unowned2 && unowned2.name} not owned by {p:${player2.token}}`, unowned2)
    assert(`${improved && improved.name} has improvements`, improved)

    return {
      amount: [amount1, amount2],
      interest: [interest1, interest2],
      properties: [properties1, properties2]
    }
  }

  /**
   * Starts or modifies a trade between two players
   *
   * @param {string} token
   * @param {string} withToken
   * @param {object[]} trade ([0] token's, [1] withToken's)
   * @param {string[]} trade.properties
   * @param {number} trade.amount
   */
  makeTrade(token, withToken, trade) {
    const tradeData = {
      players: [token, withToken],
      [token]: { amount: 0, properties: [], ...trade[0] },
      [withToken]: { amount: 0, properties: [], ...trade[1] }
    }

    // validations done here
    this._validateTrade(tradeData)

    const tradeIndex = this.state.trades.findIndex((t) =>
      t.players.includes(token) && t.players.includes(withToken))

    if (tradeIndex > -1) {
      this.store.dispatch(actions.modifyTrade(tradeIndex, tradeData))
    } else {
      this.store.dispatch(actions.makeTrade(tradeData))
    }

    this.update('trade', `{p:${token}} made an offer with {p:${withToken}}`, [token, withToken])
  }

  /**
   * Cancels a trade between two players
   *
   * @param {string} token
   * @param {string} withToken
   */
  cancelTrade(token, withToken) {
    const tradeIndex = this.state.trades.findIndex((t) =>
      t.players.includes(token) && t.players.includes(withToken))

    assert('Cannot find trade with {p:${withToken}}', tradeIndex === -1)

    this.store.dispatch(actions.deleteTrade(tradeIndex))

    this.update('trade', `{p:${token}} declined to trade with {p:${withToken}}`, [token, withToken])
  }

  /**
   * Transfers items between two players
   *
   * @param {string} token
   * @param {string} withToken
   */
  finalizeTrade(token, withToken) {
    const trade = this.state.trades.find((t) =>
      t.players.includes(token) && t.players.includes(withToken))

    assert('Cannot find trade with {p:${withToken}}', !trade)

    // validations done here
    const { amount, interest, properties } = this._validateTrade(trade)
    
    if (amount[0]) this.store.dispatch(actions.transferMoney(token, withToken, amount[0]))
    if (amount[1]) this.store.dispatch(actions.transferMoney(withToken, token, amount[1]))
    if (interest[0]) this.store.dispatch(actions.bankTransfer(withToken, interest[0]))
    if (interest[1]) this.store.dispatch(actions.bankTransfer(token, interest[1]))
    properties[0].forEach((p) => this.store.dispatch(actions.transferProperty(withToken, p.name)))
    properties[1].forEach((p) => this.store.dispatch(actions.transferProperty(token, p.name)))
    this.store.dispatch(actions.deleteTrade(this.state.trades.indexOf(trade)))

    this.update('game', `{p:${token} traded with {p:${withToken}}`, [token, withToken])
  }
}
