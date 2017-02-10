import { assert, dasherize, uniqueValue } from './helpers'
import { createStore } from 'redux'
import reducer from './reducer'
import * as actions from './actions'

import undoable, {
  includeAction,
  ActionCreators as undoActions,
} from 'redux-undo'

import {
  gameDefaults,
  playerDefaults,
  propertyDefaults
} from './defaults'

// Create IDs if they don't exists and set defaults
function withDefaults(defs) {
  return function(obj, i, arr) {
    let _id = obj._id || uniqueValue('_id', dasherize(obj.name), arr)
    return { _id, ...defs, ...obj }
  }
}

// The Game Class
// ==================

export default class MonopolyGame {

  constructor(state) {
    state = { ...gameDefaults, ...state }

    // initial state
    this.state = { ...state,
      bank: state.bank === -1 ? Infinity : state.bank,
      players: state.players.map(withDefaults(playerDefaults)),
      properties: state.properties.map(withDefaults(propertyDefaults))
    }

    // store
    this.store = createStore(undoable(reducer, {
      filter: includeAction('ADD_HISTORY')
    }), { past: [], present: this.state, future: [] })

    // subscribers
    this._subscribers = []

    this.subscribe = (fn) => {
      this._subscribers.push(fn)
    }

    this.update = (message, involved) => {
      if (message) {
        this.store.dispatch(actions.saveState(message, involved))
        this.store.dispatch(actions.addHistory())
      }

      this._subscribers.forEach((fn) => fn(!message))
    }

    // update state
    this.store.subscribe(() => {
      let { present } = this.store.getState()
      this.state = present
    })

    // first history entry
    this.store.dispatch(actions.saveState('Game initialized'))
    this.store.dispatch(actions.addHistory())
  }

  join(name = '', token = '') {
    name = name.toUpperCase()

    if (!token) {
      token = this.state.tokens.find((t) =>
        !this.state.players.find((p) => p.token === t))
    }

    let _id = dasherize(`${name}-${token}`)
    let player = { _id, name, token, balance: 0 }

    assert(`${name} is already playing`, this.state.players.find((p) => p._id === _id))
    assert('Token already taken', this.state.players.find((p) => p.token === token))
    assert('Bank funds are insufficient', this.state.bank - this.state.start < 0)

    this.store.dispatch(actions.joinGame(player))
    this.store.dispatch(actions.bankTransfer(_id, -this.state.start))

    this.update(`${name} joined the game`, [player._id])

    return _id
  }

  activatePlayer(playerID) {
    this.store.dispatch(actions.activatePlayer(playerID))
    this.update()
  }

  deactivatePlayer(playerID) {
    this.store.dispatch(actions.activatePlayer(playerID, false))
    this.update()
  }

  payBank(playerID, amount) {
    let player = this.getPlayer(playerID)

    assert('Cannot pay negative amounts', amount < 0)
    assert('Insufficient funds', player.balance - amount < 0)

    this.store.dispatch(actions.bankTransfer(player._id, amount))

    this.update(`${player.name} paid the bank $${amount}`, [player._id])
  }

  payPlayer(fromPlayerID, toPlayerID, amount) {
    let fromPlayer = this.getPlayer(fromPlayerID)
    let toPlayer = this.getPlayer(toPlayerID)

    assert('Cannot pay negative amounts', amount < 0)
    assert('Insufficient funds', fromPlayer.balance - amount < 0)

    this.store.dispatch(actions.transferMoney(fromPlayer._id, toPlayer._id, amount))

    this.update(`${fromPlayer.name} paid ${toPlayer.name} $${amount}`,
      [fromPlayer._id, toPlayer._id])
  }

  collectMoney(playerID, amount) {
    let player = this.getPlayer(playerID)

    assert('Cannot collect negative amounts', amount < 0)
    assert('Bank funds are insufficient', this.state.bank - amount < 0)

    this.store.dispatch(actions.bankTransfer(player._id, -amount))

    this.update(`${player.name} collected $${amount}`, [player._id])
  }

  buyProperty(playerID, propertyID, price) {
    let player = this.getPlayer(playerID)
    let property = this.getProperty(propertyID)

    if (typeof price === 'undefined') {
      price = property.price
    }

    assert(`You already own ${property.name}`, property.owner === playerID)
    assert(`${property.name} is already owned`, property.owner !== 'bank')
    assert('Insufficient funds', player.balance - price < 0)

    this.store.dispatch(actions.bankTransfer(player._id, price))
    this.store.dispatch(actions.transferProperty(player._id, property._id))

    this.update(`${player.name} purchased ${property.name}`, [player._id])
  }

  payRent(playerID, propertyID, roll = 2) {
    let player = this.getPlayer(playerID)
    let property = this.getProperty(propertyID)
    let owner = this.getPlayer(property.owner)
    let rent = 0

    let group = this.state.properties.filter((p) => p.group === property.group)
    let monopoly = group.filter((p) => p.owner === property.owner)

    if (property.group === 'utility') {
      rent = property.rent[monopoly.length - 1] * roll
    } else if (property.group === 'railroad') {
      rent = property.rent[monopoly.length - 1]
    } else {
      rent = property.buildings > 0 ? property.rent[property.buildings] :
        property.rent[0] * (monopoly.length === group.length ? 2 : 1)
    }

    assert(`${property.name} is unowned`, property.owner === 'bank')
    assert(`${property.name} has been mortgaged`, property.isMortgaged)
    assert('You own this property', property.owner === playerID)
    assert('Insufficient funds', player.balance - rent < 0)

    this.store.dispatch(actions.transferMoney(player._id, owner._id, rent))

    this.update(`${player.name} paid ${owner.name} $${rent} in rent for ${property.name}`,
      [player._id, owner._id])
  }

  improveProperty(playerID, propertyID) {
    let player = this.getPlayer(playerID)
    let property = this.getProperty(propertyID)

    let group = this.state.properties.filter((p) => p.group === property.group)
    let needsHotel = property.buildings === 4
    let houses = needsHotel ? -4 : 1
    let hotels = needsHotel ? 1 : 0

    assert(`You do not own ${property.name}`, property.owner !== playerID)
    assert('You cannot improve a railroad', property.group === 'railroad')
    assert('You cannot improve a utility', property.group === 'utility')
    assert('Must be a monopoly', !group.every((p) => p.owner === playerID))
    assert('Cannot improve a mortgaged property', property.isMortgaged)
    assert('Must build evenly', group.some((p) => p.buildings < property.buildings))
    assert(`${property.name} is already fully improved`, property.buildings === 5)
    assert('Not enough houses', !needsHotel && this.state.houses === 0)
    assert('Not enough hotels', needsHotel && this.state.hotels === 0)
    assert('Insufficient funds', player.balance - property.cost < 0)

    this.store.dispatch(actions.bankTransfer(player._id, property.cost))
    this.store.dispatch(actions.buildProperty(property._id, houses, hotels))

    this.update(`${player.name} improved ${property.name}`, [player._id])
  }

  unimproveProperty(playerID, propertyID, doMin) {
    let player = this.getPlayer(playerID)
    let property = this.getProperty(propertyID)

    let group = this.state.properties.filter((p) => p.group === property.group)
    let value = Math.round(property.cost * this.state.buildingRate)
    let needsHouses = property.buildings === 5
    let houses = needsHouses ? 4 : -1
    let hotels = needsHouses ? -1 : 0

    doMin = !!doMin && needsHouses && this.state.houses < 4

    if (doMin) {
      let h = group.filter((p) => p.buildings === 5).length
      value = value * (((houses * h) + h) - this.state.houses)
    }

    assert(`You do not own ${property.name}`, property.owner !== playerID)
    assert('You cannot unimprove a railroad', property.group === 'railroad')
    assert('You cannot unimprove a utility', property.group === 'utility')
    assert(`${property.name} is already fully unimproved`, property.buildings === 0)
    assert('Must build evenly', group.some((p) => p.buildings > property.buildings))
    assert('Not enough houses', !doMin && needsHouses && this.state.houses < 4)
    assert('Bank funds are insufficient', this.state.bank - value < 0)

    this.store.dispatch(actions.bankTransfer(player._id, -value))
    this.store.dispatch(actions.buildProperty(property._id, houses, hotels))

    if (doMin) {
      while (this.state.houses < 0) {
        group.sort((a, b) => a.rent[5] - b.rent[5]).forEach((p) => {
          p = this.getProperty(p._id)

          if (this.state.houses < 0 && p.buildings) {
            let needsHouses = p.buildings === 5
            let houses = needsHouses ? 4 : -1
            let hotels = needsHouses ? -1 : 0

            this.store.dispatch(actions.buildProperty(p._id, houses, hotels))
          }
        })
      }
    }

    this.update(`${player.name} unimproved ${property.name}`, [player._id])
  }

  mortgageProperty(playerID, propertyID, unimprove) {
    let player = this.getPlayer(playerID)
    let property = this.getProperty(propertyID)

    let value = Math.round(property.price * this.state.mortgageRate)

    assert(`You do not own ${property.name}`, property.owner !== playerID)
    assert(`${property.name} is already mortgaged`, property.isMortgaged)
    assert(`${property.name} still has improvements`, property.buildings > 0)
    assert('Bank funds are insufficient', this.state.bank - value < 0)

    this.store.dispatch(actions.bankTransfer(player._id, -value))
    this.store.dispatch(actions.mortgageProperty(property._id))

    this.update(`${player.name} mortaged ${property.name}`, [player._id])
  }

  unmortgageProperty(playerID, propertyID, noInterest) {
    let player = this.getPlayer(playerID)
    let property = this.getProperty(propertyID)

    let principle = Math.round(property.price * this.state.mortgageRate)
    let interest = Math.round(principle * this.state.interestRate)
    let cost = noInterest ? principle : principle + interest

    assert(`You do not own ${property.name}`, property.owner !== playerID)
    assert(`${property.name} is not mortgaged`, !property.isMortgaged)
    assert('Insufficient funds', player.balance - cost < 0)

    this.store.dispatch(actions.bankTransfer(player._id, cost))
    this.store.dispatch(actions.mortgageProperty(property._id, true))

    this.update(`${player.name} unmortaged ${property.name}`, [player._id])
  }

  makeTrade(transaction1, transaction2) {
    let player1 = this.getPlayer(transaction1.player)
    let player2 = this.getPlayer(transaction2.player)

    let money1 = transaction1.money || 0
    let money2 = transaction2.money || 0

    let addPropertyInterest = (i, p) => {
      if (p.isMortgaged) {
        let principle = Math.round(p.price * this.state.mortgageRate)
        return i + Math.round(principle * this.state.interestRate)
      }

      return 0
    }

    let properties1 = transaction1.properties || []
    properties1 = properties1.map((_id) => this.getProperty(_id))
    let interest1 = properties1.reduce(addPropertyInterest, 0)

    let properties2 = transaction2.properties || []
    properties2 = properties2.map((_id) => this.getProperty(_id))
    let interest2 = properties2.reduce(addPropertyInterest, 0)

    assert(`${player1.name} has insufficient funds`, player1.balance - money1 - interest2 < 0)
    assert(`${player2.name} has insufficient funds`, player2.balance - money2 - interest1 < 0)
    assert(`Property not owned by ${player1.name}`, !properties1.every((p) => p.owner === player1._id))
    assert(`Property not owned by ${player2.name}`, !properties2.every((p) => p.owner === player2._id))

    if (money1) this.store.dispatch(actions.transferMoney(player1._id, player2._id, money1))
    if (money2) this.store.dispatch(actions.transferMoney(player2._id, player1._id, money2))
    if (interest1) this.store.dispatch(actions.bankTransfer(player2._id, interest1))
    if (interest2) this.store.dispatch(actions.bankTransfer(player1._id, interest2))

    properties1.forEach((p) => this.store.dispatch(actions.transferProperty(player2._id, p._id)))
    properties2.forEach((p) => this.store.dispatch(actions.transferProperty(player1._id, p._id)))

    let trade1 = money1 ? '$' + money1 : ''
    if (properties1.length) trade1 += (money1 ? ' and ' : '') + properties1.join(', ')
    else if (!money1) trade1 = 'nothing'

    let trade2 = money2 ? '$' + money2 : ''
    if (properties2.length) trade2 += (money2 ? ' and ' : '') + properties2.join(', ')
    else if (!money2) trade2 = 'nothing'

    this.update(`${player1.name} traded ${player2.name} ${trade1} for ${trade2}`,
      [player1._id, player2._id])
  }

  claimBankruptcy(playerID, beneficiaryID) {
    let player = this.getPlayer(playerID)
    let beneficiary = this.getPlayer(beneficiaryID)

    let properties = this.state.properties.filter((p) => p.owner === playerID)

    let value = Math.min(properties.reduce((v, p) => {
      return v + (p.buildings * (p.cost * this.state.buildingRate))
    }, 0), this.state.bank)

    properties.forEach((p) => {
      let needsHouses = p.buildings === 5
      let hotels = needsHouses ? -1 : 0
      let houses = needsHouses ? -4 : -p.buildings

      this.store.dispatch(actions.buildProperty(p._id, houses, hotels))
      this.store.dispatch(actions.transferProperty(beneficiary._id, p._id))
    })

    if (beneficiaryID === 'bank') {
      this.store.dispatch(actions.bankTransfer(player._id, player.balance))
    } else {
      this.store.dispatch(actions.bankTransfer(player._id, -value))
      this.store.dispatch(actions.transferMoney(player._id, beneficiary._id,
        value + player.balance))
    }

    this.store.dispatch(actions.bankruptPlayer(player._id))

    this.update(`${player.name} claimed bankruptcy`, [player._id])
  }

  undo(entryID) {
    let { past, present } = this.store.getState()
    let index = present.entry === entryID ? past.length - 1 :
      past.findIndex((s) => s.entry === entryID)

    assert('Cannot find entry in history', index < 0)

    this.store.dispatch(undoActions.jumpToPast(index - 1))

    this.update(`Game reset to before ${past[index].note}`)
  }

  getPlayer(_id) {
    let player = this.state.players.find((p) => p._id === _id)

    if (!player && _id === 'bank') {
      return { _id,
        name: 'Bank',
        token: 'bank',
        balance: this.state.bank
      }
    }

    assert('Player not found', !player)
    return player
  }

  getProperty(_id) {
    let property = this.state.properties.find((p) => p._id === _id)
    assert('Property not found', !property)
    return property
  }
}
