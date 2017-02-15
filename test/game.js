import assert from 'assert'

import MonopolyGame from '../lib/game'

import initialState from './state'
import { tokens } from '../public/themes/classic/theme.json'

function isMonopolyError(err) {
  return err.name === 'MonopolyError'
}

describe('Game', () => {
  let game, p1, p2, p3

  beforeEach(() => {
    [p1, p2, p3] = initialState.players
    game = new MonopolyGame(initialState)

    game.subscribe(() => {
      [p1, p2, p3] = game.state.players
    })
  })

  it('should initialize a game', () => {
    assert.ok(game instanceof MonopolyGame)
  })

  describe('#join()', () => {
    let p4

    beforeEach(() => {
      p4 = {
        name: 'PLAYER 4',
        token: tokens[3]
      }

      game.subscribe(() => {
        p4 = game.state.players.find((p) => {
          return p.name === p4.name && p4.token == p4.token
        }) || p4
      })
    })

    it('the player cannot use a token already in use', () => {
      let playerCount = game.state.players.length

      assert.throws(() => {
        game.join(p4.name, tokens[0])
      }, isMonopolyError)

      assert.equal(game.state.players.length, playerCount)
    })

    it('the bank must have a sufficient balance', () => {
      game.join(p4.name, p4.token)

      assert.equal(game.state.bank, 0)

      assert.throws(() => {
        game.join('Player 5')
      }, isMonopolyError)

      assert.equal(game.state.bank, 0)
    })

    it('the player\'s balance should be set to the start amount', () => {
      assert.ok(!p4.balance)

      game.join(p4.name, p4.token)

      assert.equal(p4.balance, game.state.start)
    })

    it('the bank\'s balance should be decreased by the start amount', () => {
      assert.equal(game.state.bank, game.state.start)

      game.join(p4.name, p4.token)

      assert.equal(game.state.bank, 0)
    })
  })

  describe('#payBank()', () => {

    it('The player must have a sufficient balance', () => {
      game.payBank(p1._id, p1.balance)

      let bank = game.state.bank

      assert.throws(() => {
        game.payBank(p1._id, 100)
      }, isMonopolyError)

      assert.equal(p1.balance, 0)
      assert.equal(game.state.bank, bank)
    })

    it('The amount must not be a negative value', () => {
      let bal = p1.balance
      let bank = game.state.bank

      assert.throws(() => {
        game.payBank(p1._id, -100)
      }, isMonopolyError)

      assert.equal(p1.balance, bal)
      assert.equal(game.state.bank, bank)
    })

    it('The player\'s balance should be decreased by the amount', () => {
      let bal = p1.balance

      game.payBank(p1._id, 100)

      assert.equal(p1.balance, bal - 100)
    })

    it('The bank\'s balance should be increased by the amount', () => {
      let bank = game.state.bank

      game.payBank(p1._id, 100)

      assert.equal(game.state.bank, bank + 100)
    })
  })

  describe('#payPlayer()', () => {

    it('The player must have a sufficient balance', () => {
      let bal = p2.balance

      game.payBank(p1._id, p1.balance)

      assert.throws(() => {
        game.payPlayer(p1._id, p2._id, 100)
      }, isMonopolyError)

      assert.equal(p1.balance, 0)
      assert.equal(p2.balance, bal)
    })

    it('The amount must not be a negative value', () => {
      let bal1 = p1.balance
      let bal2 = p2.balance

      assert.throws(() => {
        game.payPlayer(p1._id, p2._id, -100)
      }, isMonopolyError)

      assert.equal(p1.balance, bal1)
      assert.equal(p2.balance, bal2)
    })

    it('The player\'s balance should be decreased by the amount', () => {
      let bal = p1.balance

      game.payPlayer(p1._id, p2._id, 100)

      assert.equal(p1.balance, bal - 100)
    })

    it('The other player\'s balance should be increased by the amount', () => {
      let bal = p2.balance

      game.payPlayer(p1._id, p2._id, 100)

      assert.equal(p2.balance, bal + 100)
    })
  })

  describe('#collectMoney()', () => {

    it('The bank must have a sufficient balance', () => {
      game.collectMoney(p1._id, game.state.bank)

      let bal = p1.balance

      assert.throws(() => {
        game.collectMoney(p1._id, 100)
      }, isMonopolyError)

      assert.equal(p1.balance, bal)
      assert.equal(game.state.bank, 0)
    })

    it('The amount must not be a negative value', () => {
      let bal = p1.balance
      let bank = game.state.bank

      assert.throws(() => {
        game.collectMoney(p1._id, -100)
      }, isMonopolyError)

      assert.equal(p1.balance, bal)
      assert.equal(game.state.bank, bank)
    })

    it('The bank\'s balance should be decreased by a set amount', () => {
      let bank = game.state.bank

      game.collectMoney(p1._id, 100)

      assert.equal(game.state.bank, bank - 100)
    })

    it('The player\'s balance should be increased by a set amount', () => {
      let bal = p1.balance

      game.collectMoney(p1._id, 100)

      assert.equal(p1.balance, bal + 100)
    })
  })

  describe('#buyProperty()', () => {
    let property

    beforeEach(() => {
      property = game.state.properties.find((p) => p.owner === 'bank')

      game.subscribe(() => {
        property = game.getProperty(property._id)
      })
    })

    it('The property must not already be owned', () => {
      let property2 = game.state.properties.find((p) => p.owner !== 'bank')

      assert.throws(() => {
        game.buyProperty(p1._id, property2._id)
      }, isMonopolyError)

      assert.notEqual(property2.owner, 'bank')
    })

    it('The player must have a sufficient balance', () => {
      let bal = p1.balance

      game.payBank(p1._id, bal)

      assert.equal(p1.balance, 0)

      assert.throws(() => {
        game.buyProperty(p1._id, property._id)
      }, isMonopolyError)

      assert.equal(p1.balance, 0)
    })

    it('The purchase amount should default to the property\'s price', () => {
      let bal = p1.balance - property.price

      game.buyProperty(p1._id, property._id)

      assert.equal(p1.balance, bal)
    })

    it('The player\'s balance should be decreased by the amount', () => {
      let bal = p1.balance - 1

      game.buyProperty(p1._id, property._id, 1)

      assert.equal(p1.balance, bal)
    })

    it('The bank\'s balance should be increased by the amount', () => {
      let bal = game.state.bank + 1

      game.buyProperty(p1._id, property._id, 1)

      assert.equal(game.state.bank, bal)
    })

    it('The player should become the property\'s owner', () => {
      game.buyProperty(p1._id, property._id)

      assert.equal(property.owner, p1._id)
    })
  })

  describe('#payRent()', () => {
    let property

    beforeEach(() => {
      property = game.state.properties.find((p) => p.owner === p2._id)

      game.subscribe(() => {
        property = game.getProperty(property._id)
      })
    })

    it('The property must not be mortgaged', () => {
      let bal = p1.balance

      game.mortgageProperty(p2._id, property._id)

      assert.throws(() => {
        game.payRent(p1._id, property._id)
      }, isMonopolyError)

      assert.equal(p1.balance, bal)
    })

    it('The rent should be double for monopolies', () => {
      let rent = property.rent[0] * 2
      let bal = p1.balance - rent

      game.payRent(p1._id, property._id)

      assert.equal(p1.balance, bal)
    })

    it('The rent should scale with improvements', () => {
      let property1 = game.state.properties.find((p) => p.buildings === 5)
      let property2 = game.state.properties.find((p) => {
        return p.group === property1.group && p.buildings === 4
      })

      let rent1 = property1.rent[5]
      let rent2 = property2.rent[4]

      let bal1 = p2.balance - rent1
      let bal2 = p3.balance - rent2

      game.payRent(p2._id, property1._id)
      game.payRent(p3._id, property2._id)

      assert.equal(p2.balance, bal1)
      assert.equal(p3.balance, bal2)
    })

    it('The rent for railroads should be based on the amount owned', () => {
      let railroads = game.state.properties.filter((p) => {
        return p.owner === p3._id && p.group === 'railroad'
      })

      let rent = railroads[0].rent[0] * railroads.length
      let bal = p1.balance - rent

      game.payRent(p1._id, railroads[0]._id)

      assert.equal(p1.balance, bal)
    })

    it('The rent for utilities should be a multiple of the number rolled', () => {
      let utility = game.state.properties.find((p) => {
        return p.owner === p3._id && p.group == 'utility'
      })

      let rent = utility.rent[0] * 5
      let bal = p1.balance - rent

      game.payRent(p1._id, utility._id, 5)

      assert.equal(p1.balance, bal)
    })

    it('The player must have a sufficient balance', () => {
      game.payBank(p1._id, p1.balance)

      assert.throws(() => {
        game.payRent(p1._id, property._id)
      }, isMonopolyError)

      assert.equal(p1.balance, 0)
    })

    it('The player\'s balance should be decreased by the rent', () => {
      let bal = p1.balance - (property.rent[0] * 2)

      game.payRent(p1._id, property._id)

      assert.equal(p1.balance, bal)
    })

    it('The owner\'s balance should be increased by the rent', () => {
      let bal = p2.balance + (property.rent[0] * 2)

      game.payRent(p1._id, property._id)

      assert.equal(p2.balance, bal)
    })
  })

  describe('#improveProperty()', () => {
    let property

    beforeEach(() => {
      property = game.state.properties.find((p) => p.owner === p2._id)
      game.subscribe(() => property = game.getProperty(property._id))
    })

    it('The property must be owned by the player', () => {
      assert.throws(() => {
        game.improveProperty(p1._id, property._id)
      }, isMonopolyError)

      assert.equal(property.buildings, 0)
    })

    it('The property must not be a railroad or utility', () => {
      let railroad = game.state.properties.find((p) =>
        p.owner === p3._id && p.group === 'railroad')
      let utility = game.state.properties.find((p) =>
        p.owner === p3._id && p.group === 'utility')

      assert.throws(() => {
        game.improveProperty(p3._id, railroad)
      }, isMonopolyError)

      assert.throws(() => {
        game.improveProperty(p3._id, railroad)
      }, isMonopolyError)
    })

    it('The property must be part of a monopoly', () => {
      let property = game.state.properties.find((p) => p.owner === 'bank')

      game.buyProperty(p1._id, property._id, 1)

      assert.throws(() => {
        game.improveProperty(p1._id, property._id)
      }, isMonopolyError)

      property = game.getProperty(property._id)

      assert.equal(property.buildings, 0)
    })

    it('The property must not be mortgaged', () => {
      game.mortgageProperty(p2._id, property._id)

      assert.throws(() => {
        game.improveProperty(p2._id, property._id)
      }, isMonopolyError)

      assert.equal(property.buildings, 0)
    })

    it('The property must not be already fully improved', () => {
      let property = game.state.properties.find((p) => p.buildings === 5);

      assert.throws(() => {
        game.improveProperty(p1._id, property._id)
      }, isMonopolyError)

      property = game.getProperty(property._id)

      assert.equal(property.buildings, 5)
    })

    it('The property\'s group must be improved evenly', () => {
      game.improveProperty(p2._id, property._id)

      assert.throws(() => {
        game.improveProperty(p2._id, property._id)
      }, isMonopolyError)

      assert.equal(property.buildings, 1)
    })

    it('The player must have a sufficient balance', () => {
      game.payBank(p2._id, p2.balance)

      assert.throws(() => {
        game.improveProperty(p2._id, property._id)
      }, isMonopolyError)

      assert.equal(p2.balance, 0)
      assert.equal(property.buildings, 0)
    })

    it('There must be a sufficient number of houses/hotels', () => {
      let group = game.state.properties.filter((p) => p.group === property.group)

      group.forEach((p) => game.improveProperty(p2._id, p._id))
      game.improveProperty(p2._id, group[0]._id)

      assert.throws(() => {
        game.improveProperty(p2._id, group[1]._id)
      }, isMonopolyError)

      let prop = game.getProperty(group[1]._id)

      assert.equal(prop.buildings, 1)
    })

    it('The player\'s balance should be decreased by the building cost', () => {
      let bal = p2.balance - property.cost

      game.improveProperty(p2._id, property._id)

      assert.equal(p2.balance, bal)
    })

    it('The bank\'s balance should be increased by the building cost', () => {
      let bal = game.state.bank + property.cost

      game.improveProperty(p2._id, property._id)

      assert.equal(game.state.bank, bal)
    })

    it('The available houses/hotels should be decreased by 1', () => {
      let property2 = game.state.properties.find((p) => p.buildings === 4)
      let hotels = game.state.hotels - 1
      let houses = game.state.houses - 1

      game.improveProperty(p2._id, property._id)

      assert.equal(game.state.houses, houses)

      game.improveProperty(p1._id, property2._id)

      assert.equal(game.state.hotels, hotels)
    })

    it('The available houses should increase by 4 if a hotel is needed', () => {
      let property = game.state.properties.find((p) => p.buildings === 4)
      let houses = game.state.houses + 4

      game.improveProperty(p1._id, property._id)

      assert.equal(game.state.houses, houses)
    })

    it('The property\'s building count should be increased by 1', () => {
      game.improveProperty(p2._id, property._id)

      assert.equal(property.buildings, 1)
    })
  })

  describe('#unimproveProperty()', () => {
    let property

    beforeEach(() => {
      property = game.state.properties.find((p) => p.buildings === 5)
      game.subscribe(() => property = game.getProperty(property._id))
    })

    it('The property must be owned by the player', () => {
      property = game.state.properties.find((p) => p.owner === p2._id)

      game.improveProperty(p2._id, property._id)

      assert.throws(() => {
        game.unimproveProperty(p3._id, property._id)
      }, isMonopolyError)

      assert.equal(property.buildings, 1)
    })

    it('The property must not be a railroad or utility', () => {
      let railroad = game.state.properties.find((p) =>
        p.owner === p3._id && p.group === 'railroad')
      let utility = game.state.properties.find((p) =>
        p.owner === p3._id && p.group === 'utility')

      assert.throws(() => {
        game.unimproveProperty(p3._id, railroad)
      }, isMonopolyError)

      assert.throws(() => {
        game.unimproveProperty(p3._id, railroad)
      }, isMonopolyError)
    })

    it('The property must have improvements', () => {
      property = game.state.properties.find((p) => p.owner === p2._id)

      assert.throws(() => {
        game.unimproveProperty(p2._id, property._id)
      }, isMonopolyError)

      assert.equal(property.buildings, 0)
    })

    it('The property\'s group must be unimproved evenly', () => {
      property = game.state.properties.find((p) => p.buildings === 4)

      assert.throws(() => {
        game.unimproveProperty(p1._id, property._id)
      }, isMonopolyError)

      assert.equal(property.buildings, 4)
    })

    it('There must be a sufficient number of houses if needed', () => {
      let property2 = game.state.properties.find((p) => p.owner === p2._id)

      game.improveProperty(p2._id, property2._id)

      assert.throws(() => {
        game.unimproveProperty(p1._id, property._id)
      }, isMonopolyError)

      assert.equal(property.buildings, 5)
    })

    it('The property\'s group should be minimally unimproved if requested', () => {
      let group = game.state.properties.filter((p) => p.group === property.group)
      let property2 = game.state.properties.find((p) => p.owner === p2._id)

      game.improveProperty(p2._id, property2._id)
      game.unimproveProperty(p1._id, property._id, true)

      group = game.state.properties.filter((p) => p.group === property.group)

      assert.equal(group[0].buildings, 3)
      assert.equal(group[1].buildings, 4)
    })

    it('The bank must have a sufficient balance', () => {
      game.collectMoney(p1._id, game.state.bank)

      assert.throws(() => {
        game.unimproveProperty(p1._id, property._id)
      }, isMonopolyError)

      assert.equal(property.buildings, 5)
    })

    it('The bank\'s balance should be decreased by the building value', () => {
      let value = Math.round(game.state.buildingRate * property.cost)
      let bank = game.state.bank

      game.unimproveProperty(p1._id, property._id)

      assert.equal(game.state.bank, bank - value)
    })

    it('The player\'s balance should be increased by the building value', () => {
      let value = Math.round(game.state.buildingRate * property.cost)
      let bal = p1.balance

      game.unimproveProperty(p1._id, property._id)

      assert.equal(p1.balance, bal + value)
    })

    it('The value should increase by the building count when unimproving the group', () => {
      let group = game.state.properties.filter((p) => p.group === property.group)
      let property2 = game.state.properties.find((p) => p.owner === p2._id)
      let value = Math.round(game.state.buildingRate * property.cost) * 2
      let bal = p1.balance

      game.improveProperty(p2._id, property2._id)
      game.unimproveProperty(p1._id, property._id, true)

      group = game.state.properties.filter((p) => p.group === property.group)

      assert.equal(p1.balance, bal + value)
    })

    it('The available houses/hotels should be increased', () => {
      let property2 = game.state.properties.find((p) => p.owner === p2._id)

      game.improveProperty(p2._id, property2._id)

      let houses = game.state.houses + 1
      let hotels = game.state.hotels + 1

      game.unimproveProperty(p2._id, property2._id)

      assert.equal(game.state.houses, houses)

      game.unimproveProperty(p1._id, property._id)

      assert.equal(game.state.hotels, hotels)
    })

    it('The available houses should decrease if a hotel was sold', () => {
      let houses = game.state.houses - 4

      game.unimproveProperty(p1._id, property._id)

      assert.equal(game.state.houses, houses)
    })

    it('The property\'s building count should be decreased', () => {
      game.unimproveProperty(p1._id, property._id)

      assert.equal(property.buildings, 4)
    })
  })

  describe('#mortgageProperty()', () => {
    let property

    beforeEach(() => {
      property = game.state.properties.find((p) => p.owner === p2._id)
      game.subscribe(() => property = game.getProperty(property._id))
    })

    it('The property must be owned by the player', () => {
      assert.throws(() => {
        game.mortgageProperty(p1._id, property._id)
      }, isMonopolyError)

      assert.ok(!property.isMortgaged)
    })

    it('The property must not already be mortgaged', () => {
      game.mortgageProperty(p2._id, property._id)

      assert.throws(() => {
        game.mortgageProperty(p2._id, property._id)
      }, isMonopolyError)
    })

    it('The property must not have any improvements', () => {
      game.improveProperty(p2._id, property._id)

      assert.throws(() => {
        game.mortgageProperty(p2._id, property._id)
      }, isMonopolyError)

      assert.ok(!property.isMortgaged)
    })

    it('Tha bank must have a sufficient balance', () => {
      game.collectMoney(p1._id, game.state.bank)

      assert.throws(() => {
        game.mortgageProperty(p2._id, property._id)
      }, isMonopolyError)

      assert.ok(!property.isMortgaged)
    })

    it('The bank\'s balance should be decreased by the mortgage', () => {
      let mortgage = Math.round(property.price * game.state.mortgageRate)
      let bank = game.state.bank

      game.mortgageProperty(p2._id, property._id)

      assert.equal(game.state.bank, bank - mortgage)
    })

    it('The player\'s balance should be increased by the mortgage', () => {
      let mortgage = Math.round(property.price * game.state.mortgageRate)
      let bal = p2.balance

      game.mortgageProperty(p2._id, property._id)

      assert.equal(p2.balance, bal + mortgage)
    })

    it('The property should be mortgaged', () => {
      game.mortgageProperty(p2._id, property._id)

      assert.ok(property.isMortgaged)
    })
  })

  describe('#unmortgageProperty()', () => {
    let property

    beforeEach(() => {
      property = game.state.properties.find((p) => p.isMortgaged)
      game.subscribe(() => property = game.getProperty(property._id))
    })

    it('The property must be owned by the player', () => {
      assert.throws(() => {
        game.unmortgageProperty(p2._id, property._id)
      }, isMonopolyError)

      assert.ok(property.isMortgaged)
    })

    it('The property must be mortgaged', () => {
      property = game.state.properties.find((p) => p.owner === p2._id)

      assert.throws(() => {
        game.unmortgageProperty(p2._id, property._id)
      }, isMonopolyError)

      assert.ok(!property.isMortgaged)
    })

    it('The player must have a sufficient balance', () => {
      game.payBank(p3._id, p3.balance)

      assert.throws(() => {
        game.unmortgageProperty(p3._id, property._id)
      }, isMonopolyError)

      assert.ok(property.isMortgaged)
    })

    it('The player\'s balance should be decreased by the mortgage plus interest', () => {
      let principle = Math.round(property.price * game.state.mortgageRate)
      let interest = Math.round(principle * game.state.interestRate)
      let mortgage = principle + interest
      let bal = p3.balance

      game.unmortgageProperty(p3._id, property._id)

      assert.equal(p3.balance, bal - mortgage)
    })

    it('The bank\'s balance should be increased by the mortgage plus interest', () => {
      let principle = Math.round(property.price * game.state.mortgageRate)
      let interest = Math.round(principle * game.state.interestRate)
      let mortgage = principle + interest
      let bank = game.state.bank

      game.unmortgageProperty(p3._id, property._id)

      assert.equal(game.state.bank, bank + mortgage)
    })

    it('The player should be able to pay the mortgage without interest', () => {
      let mortgage = Math.round(property.price * game.state.mortgageRate)
      let bank = game.state.bank
      let bal = p3.balance

      game.unmortgageProperty(p3._id, property._id, true)

      assert.equal(p3.balance, bal - mortgage)
      assert.equal(game.state.bank, bal + mortgage)
    })

    it('The property should not be mortgaged', () => {
      game.unmortgageProperty(p3._id, property._id)

      assert.ok(!property.isMortgaged)
    })
  })

  describe('#makeTrade()', () => {
    let property1, property2

    beforeEach(() => {
      property1 = game.state.properties.find((p) => p.owner === p2._id)
      property2 = game.state.properties.find((p) => p.owner === p3._id)

      game.subscribe(() => {
        property1 = game.getProperty(property1._id)
        property2 = game.getProperty(property2._id)
      })
    })

    it('The properties must be owned by the players', () => {
      assert.throws(() => {
        game.makeTrade({
          player: p1._id,
          properties: [property1._id]
        }, {
          player: p3._id,
          properties: [property2._id]
        })
      }, isMonopolyError)

      assert.equal(property1.owner, p2._id)
      assert.equal(property2.owner, p3._id)
    })

    it('The properties must not have any improvements', () => {
      let property2 = game.state.properties.find((p) => p.owner === p1._id)

      assert.throws(() => {
        game.makeTrade({
          player: p1._id,
          properties: [property2]
        }, {
          player: p2._id,
          properties: [property1]
        })
      }, isMonopolyError)

      assert.equal(property1.owner, p2._id)
      assert.equal(property2.owner, p1._id)
    })

    it('The players should have sufficient balances', () => {
      game.payBank(p2._id, p2.balance)

      assert.throws(() => {
        game.makeTrade({
          player: p2._id,
          properties: [property1._id]
        }, {
          player: p3._id,
          properties: [property2._id]
        })
      }, isMonopolyError)

      assert.equal(property1.owner, p2._id)
      assert.equal(property2.owner, p3._id)
    })

    it('The players\' balances should be increased/decreased by the net value', () => {
      let principle = Math.round(property2.price * game.state.mortgageRate)
      let interest = Math.round(principle * game.state.interestRate)
      let bal1 = p2.balance
      let bal2 = p3.balance

      game.makeTrade({
        player: p2._id,
        properties: [property1._id],
        money: 100
      }, {
        player: p3._id,
        properties: [property2._id],
        money: 200
      })

      assert.equal(p2.balance, bal1 - 100 + 200 - interest)
      assert.equal(p3.balance, bal2 + 100 - 200)
    })

    it('The properties\' owners should be switched', () => {
      game.makeTrade({
        player: p2._id,
        properties: [property1._id]
      }, {
        player: p3._id,
        properties: [property2._id]
      })

      assert.equal(property1.owner, p3._id)
      assert.equal(property2.owner, p2._id)
    })
  })

  describe('#claimBankruptcy()', () => {
    let properties, bal

    beforeEach(() => {
      properties = game.state.properties.filter((p) => p.owner === p1._id)

      game.subscribe(() => {
        properties = properties.map((p) => game.getProperty(p._id))
      })
    })

    it('The player\'s properties should be unimproved', () => {
      game.claimBankruptcy(p1._id, p2._id)

      properties.forEach((p) => assert.equal(p.buildings, 0))
    })

    it('The beneficiary should recieve the player\'s balance plus improvement values', () => {
      let bal1 = p1.balance
      let bal2 = p2.balance
      let value = properties.reduce((v, p) => {
        return v + (p.buildings * Math.round(p.cost * game.state.buildingRate))
      }, 0)


      game.claimBankruptcy(p1._id, p2._id)

      assert.equal(p2.balance, bal2 + bal1 + value)
    })

    it('The beneficiary should become the properties\' owner', () => {
      game.claimBankruptcy(p1._id, p2._id)

      properties.forEach((p) => assert.equal(p.owner, p2._id))
    })

    it('The bank should be allowed to be the beneficiary', () => {
      let bal = p1.balance
      let bank = game.state.bank

      game.claimBankruptcy(p1._id, 'bank')

      assert.equal(game.state.bank, bank + bal)
      properties.forEach((p) => assert.equal(p.owner, 'bank'))
    })

    it('The player should be bankrupt', () => {
      game.claimBankruptcy(p1._id, p2._id)

      assert.ok(p1.isBankrupt)
      assert.equal(p1.balance, 0)
      properties.forEach((p) => assert.notEqual(p.owner, p1._id))
    })
  })

  describe('#undo()', () => {
    let property

    beforeEach(() => {
      property = game.state.properties.find((p) => p.owner === p2._id)
      game.subscribe(() => property = game.getProperty(property._id))
    })

    it('The game should be reset to the specified state', () => {
      let entryID, bal = p2.balance

      game.payBank(p2._id, 100)
      entryID = game.state.entry

      game.mortgageProperty(p2._id, property._id)

      assert.ok(property.isMortgaged)
      assert.notEqual(p2.balance, bal)

      game.undo(entryID)

      assert.ok(!property.isMortgaged)
      assert.equal(p2.balance, bal)
    })
  })

  describe('#getPlayer()', () => {

    it('should get a player by id', () => {
      let player = game.getPlayer(p1._id)
      assert.equal(player._id, p1._id)
      assert.equal(player.name, p1.name)
    })
  })

  describe('#getProperty()', () => {

    it('should get a property by id', () => {
      let property = game.state.properties[0]
      let prop = game.getProperty(property._id)
      assert.equal(prop._id, property._id)
      assert.equal(prop.name, property.name)
    })
  })
})
