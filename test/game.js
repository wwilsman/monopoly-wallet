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
        name: 'player 4',
        token: tokens[3]
      }

      game.subscribe(() => {
        p4 = game.getPlayer(p4.token) || p4
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
        game.join('player 5')
      }, isMonopolyError)

      assert.equal(game.state.bank, 0)
    })

    it('the player\'s balance should be set to the start amount', () => {
      assert.ok(!p4.balance)

      game.join(p4.name, p4.token)

      assert.equal(p4.balance, game.config.playerStart)
    })

    it('the bank\'s balance should be decreased by the start amount', () => {
      assert.equal(game.state.bank, game.config.playerStart)

      game.join(p4.name, p4.token)

      assert.equal(game.state.bank, 0)
    })
  })

  describe('#payBank()', () => {

    it('The player must have a sufficient balance', () => {
      game.payBank(p1.token, p1.balance)

      let bank = game.state.bank

      assert.throws(() => {
        game.payBank(p1.token, 100)
      }, isMonopolyError)

      assert.equal(p1.balance, 0)
      assert.equal(game.state.bank, bank)
    })

    it('The amount must not be a negative value', () => {
      let bal = p1.balance
      let bank = game.state.bank

      assert.throws(() => {
        game.payBank(p1.token, -100)
      }, isMonopolyError)

      assert.equal(p1.balance, bal)
      assert.equal(game.state.bank, bank)
    })

    it('The player\'s balance should be decreased by the amount', () => {
      let bal = p1.balance

      game.payBank(p1.token, 100)

      assert.equal(p1.balance, bal - 100)
    })

    it('The bank\'s balance should be increased by the amount', () => {
      let bank = game.state.bank

      game.payBank(p1.token, 100)

      assert.equal(game.state.bank, bank + 100)
    })
  })

  describe('#payPlayer()', () => {

    it('The player must have a sufficient balance', () => {
      let bal = p2.balance

      game.payBank(p1.token, p1.balance)

      assert.throws(() => {
        game.payPlayer(p1.token, p2.token, 100)
      }, isMonopolyError)

      assert.equal(p1.balance, 0)
      assert.equal(p2.balance, bal)
    })

    it('The amount must not be a negative value', () => {
      let bal1 = p1.balance
      let bal2 = p2.balance

      assert.throws(() => {
        game.payPlayer(p1.token, p2.token, -100)
      }, isMonopolyError)

      assert.equal(p1.balance, bal1)
      assert.equal(p2.balance, bal2)
    })

    it('The player\'s balance should be decreased by the amount', () => {
      let bal = p1.balance

      game.payPlayer(p1.token, p2.token, 100)

      assert.equal(p1.balance, bal - 100)
    })

    it('The other player\'s balance should be increased by the amount', () => {
      let bal = p2.balance

      game.payPlayer(p1.token, p2.token, 100)

      assert.equal(p2.balance, bal + 100)
    })
  })

  describe('#collectMoney()', () => {

    it('The bank must have a sufficient balance', () => {
      game.collectMoney(p1.token, game.state.bank)

      let bal = p1.balance

      assert.throws(() => {
        game.collectMoney(p1.token, 100)
      }, isMonopolyError)

      assert.equal(p1.balance, bal)
      assert.equal(game.state.bank, 0)
    })

    it('The amount must not be a negative value', () => {
      let bal = p1.balance
      let bank = game.state.bank

      assert.throws(() => {
        game.collectMoney(p1.token, -100)
      }, isMonopolyError)

      assert.equal(p1.balance, bal)
      assert.equal(game.state.bank, bank)
    })

    it('The bank\'s balance should be decreased by a set amount', () => {
      let bank = game.state.bank

      game.collectMoney(p1.token, 100)

      assert.equal(game.state.bank, bank - 100)
    })

    it('The player\'s balance should be increased by a set amount', () => {
      let bal = p1.balance

      game.collectMoney(p1.token, 100)

      assert.equal(p1.balance, bal + 100)
    })
  })

  describe('#buyProperty()', () => {
    let property

    beforeEach(() => {
      property = game.state.properties.find((p) => p.owner === 'bank')

      game.subscribe(() => {
        property = game.getProperty(property.name)
      })
    })

    it('The property must not already be owned', () => {
      let property2 = game.state.properties.find((p) => p.owner !== 'bank')

      assert.throws(() => {
        game.buyProperty(p1.token, property2.name)
      }, isMonopolyError)

      assert.notEqual(property2.owner, 'bank')
    })

    it('The player must have a sufficient balance', () => {
      let bal = p1.balance

      game.payBank(p1.token, bal)

      assert.equal(p1.balance, 0)

      assert.throws(() => {
        game.buyProperty(p1.token, property.name)
      }, isMonopolyError)

      assert.equal(p1.balance, 0)
    })

    it('The purchase amount should default to the property\'s price', () => {
      let bal = p1.balance - property.price

      game.buyProperty(p1.token, property.name)

      assert.equal(p1.balance, bal)
    })

    it('The player\'s balance should be decreased by the amount', () => {
      let bal = p1.balance - 1

      game.buyProperty(p1.token, property.name, 1)

      assert.equal(p1.balance, bal)
    })

    it('The bank\'s balance should be increased by the amount', () => {
      let bal = game.state.bank + 1

      game.buyProperty(p1.token, property.name, 1)

      assert.equal(game.state.bank, bal)
    })

    it('The player should become the property\'s owner', () => {
      game.buyProperty(p1.token, property.name)

      assert.equal(property.owner, p1.token)
    })
  })

  describe('#payRent()', () => {
    let property

    beforeEach(() => {
      property = game.state.properties.find((p) => p.owner === p2.token)

      game.subscribe(() => {
        property = game.getProperty(property.name)
      })
    })

    it('The property must not be mortgaged', () => {
      let bal = p1.balance

      game.mortgageProperty(p2.token, property.name)

      assert.throws(() => {
        game.payRent(p1.token, property.name)
      }, isMonopolyError)

      assert.equal(p1.balance, bal)
    })

    it('The rent should be double for monopolies', () => {
      let rent = property.rent[0] * 2
      let bal = p1.balance - rent

      game.payRent(p1.token, property.name)

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

      game.payRent(p2.token, property1.name)
      game.payRent(p3.token, property2.name)

      assert.equal(p2.balance, bal1)
      assert.equal(p3.balance, bal2)
    })

    it('The rent for railroads should be based on the amount owned', () => {
      let railroads = game.state.properties.filter((p) => {
        return p.owner === p3.token && p.group === 'railroad'
      })

      let rent = railroads[0].rent[0] * railroads.length
      let bal = p1.balance - rent

      game.payRent(p1.token, railroads[0].name)

      assert.equal(p1.balance, bal)
    })

    it('The rent for utilities should be a multiple of the number rolled', () => {
      let utility = game.state.properties.find((p) => {
        return p.owner === p3.token && p.group == 'utility'
      })

      let rent = utility.rent[0] * 5
      let bal = p1.balance - rent

      game.payRent(p1.token, utility.name, 5)

      assert.equal(p1.balance, bal)
    })

    it('The player must have a sufficient balance', () => {
      game.payBank(p1.token, p1.balance)

      assert.throws(() => {
        game.payRent(p1.token, property.name)
      }, isMonopolyError)

      assert.equal(p1.balance, 0)
    })

    it('The player\'s balance should be decreased by the rent', () => {
      let bal = p1.balance - (property.rent[0] * 2)

      game.payRent(p1.token, property.name)

      assert.equal(p1.balance, bal)
    })

    it('The owner\'s balance should be increased by the rent', () => {
      let bal = p2.balance + (property.rent[0] * 2)

      game.payRent(p1.token, property.name)

      assert.equal(p2.balance, bal)
    })
  })

  describe('#improveProperty()', () => {
    let property

    beforeEach(() => {
      property = game.state.properties.find((p) => p.owner === p2.token)
      game.subscribe(() => property = game.getProperty(property.name))
    })

    it('The property must be owned by the player', () => {
      assert.throws(() => {
        game.improveProperty(p1.token, property.name)
      }, isMonopolyError)

      assert.equal(property.buildings, 0)
    })

    it('The property must not be a railroad or utility', () => {
      let railroad = game.state.properties.find((p) =>
        p.owner === p3.token && p.group === 'railroad')
      let utility = game.state.properties.find((p) =>
        p.owner === p3.token && p.group === 'utility')

      assert.throws(() => {
        game.improveProperty(p3.token, railroad.name)
      }, isMonopolyError)

      assert.throws(() => {
        game.improveProperty(p3.token, utility.name)
      }, isMonopolyError)
    })

    it('The property must be part of a monopoly', () => {
      let property = game.state.properties.find((p) => p.owner === 'bank')

      game.buyProperty(p1.token, property.name, 1)

      assert.throws(() => {
        game.improveProperty(p1.token, property.name)
      }, isMonopolyError)

      property = game.getProperty(property.name)

      assert.equal(property.buildings, 0)
    })

    it('The property must not be mortgaged', () => {
      game.mortgageProperty(p2.token, property.name)

      assert.throws(() => {
        game.improveProperty(p2.token, property.name)
      }, isMonopolyError)

      assert.equal(property.buildings, 0)
    })

    it('The property must not be already fully improved', () => {
      let property = game.state.properties.find((p) => p.buildings === 5);

      assert.throws(() => {
        game.improveProperty(p1.token, property.name)
      }, isMonopolyError)

      property = game.getProperty(property.name)

      assert.equal(property.buildings, 5)
    })

    it('The property\'s group must be improved evenly', () => {
      game.improveProperty(p2.token, property.name)

      assert.throws(() => {
        game.improveProperty(p2.token, property.name)
      }, isMonopolyError)

      assert.equal(property.buildings, 1)
    })

    it('The player must have a sufficient balance', () => {
      game.payBank(p2.token, p2.balance)

      assert.throws(() => {
        game.improveProperty(p2.token, property.name)
      }, isMonopolyError)

      assert.equal(p2.balance, 0)
      assert.equal(property.buildings, 0)
    })

    it('There must be a sufficient number of houses/hotels', () => {
      let group = game.state.properties.filter((p) => p.group === property.group)

      group.forEach((p) => game.improveProperty(p2.token, p.name))
      game.improveProperty(p2.token, group[0].name)

      assert.throws(() => {
        game.improveProperty(p2.token, group[1].name)
      }, isMonopolyError)

      let prop = game.getProperty(group[1].name)

      assert.equal(prop.buildings, 1)
    })

    it('The player\'s balance should be decreased by the building cost', () => {
      let bal = p2.balance - property.build

      game.improveProperty(p2.token, property.name)

      assert.equal(p2.balance, bal)
    })

    it('The bank\'s balance should be increased by the building cost', () => {
      let bal = game.state.bank + property.build

      game.improveProperty(p2.token, property.name)

      assert.equal(game.state.bank, bal)
    })

    it('The available houses/hotels should be decreased by 1', () => {
      let property2 = game.state.properties.find((p) => p.buildings === 4)
      let hotels = game.state.hotels - 1
      let houses = game.state.houses - 1

      game.improveProperty(p2.token, property.name)

      assert.equal(game.state.houses, houses)

      game.improveProperty(p1.token, property2.name)

      assert.equal(game.state.hotels, hotels)
    })

    it('The available houses should increase by 4 if a hotel is needed', () => {
      let property = game.state.properties.find((p) => p.buildings === 4)
      let houses = game.state.houses + 4

      game.improveProperty(p1.token, property.name)

      assert.equal(game.state.houses, houses)
    })

    it('The property\'s building count should be increased by 1', () => {
      game.improveProperty(p2.token, property.name)

      assert.equal(property.buildings, 1)
    })
  })

  describe('#unimproveProperty()', () => {
    let property

    beforeEach(() => {
      property = game.state.properties.find((p) => p.buildings === 5)
      game.subscribe(() => property = game.getProperty(property.name))
    })

    it('The property must be owned by the player', () => {
      property = game.state.properties.find((p) => p.owner === p2.token)

      game.improveProperty(p2.token, property.name)

      assert.throws(() => {
        game.unimproveProperty(p3.token, property.name)
      }, isMonopolyError)

      assert.equal(property.buildings, 1)
    })

    it('The property must not be a railroad or utility', () => {
      let railroad = game.state.properties.find((p) =>
        p.owner === p3.token && p.group === 'railroad')
      let utility = game.state.properties.find((p) =>
        p.owner === p3.token && p.group === 'utility')

      assert.throws(() => {
        game.unimproveProperty(p3.token, railroad.name)
      }, isMonopolyError)

      assert.throws(() => {
        game.unimproveProperty(p3.token, railroad.name)
      }, isMonopolyError)
    })

    it('The property must have improvements', () => {
      property = game.state.properties.find((p) => p.owner === p2.token)

      assert.throws(() => {
        game.unimproveProperty(p2.token, property.name)
      }, isMonopolyError)

      assert.equal(property.buildings, 0)
    })

    it('The property\'s group must be unimproved evenly', () => {
      property = game.state.properties.find((p) => p.buildings === 4)

      assert.throws(() => {
        game.unimproveProperty(p1.token, property.name)
      }, isMonopolyError)

      assert.equal(property.buildings, 4)
    })

    it('There must be a sufficient number of houses if needed', () => {
      let property2 = game.state.properties.find((p) => p.owner === p2.token)

      game.improveProperty(p2.token, property2.name)

      assert.throws(() => {
        game.unimproveProperty(p1.token, property.name)
      }, isMonopolyError)

      assert.equal(property.buildings, 5)
    })

    it('The property\'s group should be minimally unimproved if requested', () => {
      let group = game.state.properties.filter((p) => p.group === property.group)
      let property2 = game.state.properties.find((p) => p.owner === p2.token)

      game.improveProperty(p2.token, property2.name)
      game.unimproveProperty(p1.token, property.name, true)

      group = game.state.properties.filter((p) => p.group === property.group)

      assert.equal(group[0].buildings, 3)
      assert.equal(group[1].buildings, 4)
    })

    it('The bank must have a sufficient balance', () => {
      game.collectMoney(p1.token, game.state.bank)

      assert.throws(() => {
        game.unimproveProperty(p1.token, property.name)
      }, isMonopolyError)

      assert.equal(property.buildings, 5)
    })

    it('The bank\'s balance should be decreased by the building value', () => {
      let value = Math.round(game.config.buildingRate * property.build)
      let bank = game.state.bank

      game.unimproveProperty(p1.token, property.name)

      assert.equal(game.state.bank, bank - value)
    })

    it('The player\'s balance should be increased by the building value', () => {
      let value = Math.round(game.config.buildingRate * property.build)
      let bal = p1.balance

      game.unimproveProperty(p1.token, property.name)

      assert.equal(p1.balance, bal + value)
    })

    it('The value should increase by the building count when unimproving the group', () => {
      let group = game.state.properties.filter((p) => p.group === property.group)
      let property2 = game.state.properties.find((p) => p.owner === p2.token)
      let value = Math.round(game.config.buildingRate * property.build) * 2
      let bal = p1.balance

      game.improveProperty(p2.token, property2.name)
      game.unimproveProperty(p1.token, property.name, true)

      group = game.state.properties.filter((p) => p.group === property.group)

      assert.equal(p1.balance, bal + value)
    })

    it('The available houses/hotels should be increased', () => {
      let property2 = game.state.properties.find((p) => p.owner === p2.token)

      game.improveProperty(p2.token, property2.name)

      let houses = game.state.houses + 1
      let hotels = game.state.hotels + 1

      game.unimproveProperty(p2.token, property2.name)

      assert.equal(game.state.houses, houses)

      game.unimproveProperty(p1.token, property.name)

      assert.equal(game.state.hotels, hotels)
    })

    it('The available houses should decrease if a hotel was sold', () => {
      let houses = game.state.houses - 4

      game.unimproveProperty(p1.token, property.name)

      assert.equal(game.state.houses, houses)
    })

    it('The property\'s building count should be decreased', () => {
      game.unimproveProperty(p1.token, property.name)

      assert.equal(property.buildings, 4)
    })
  })

  describe('#mortgageProperty()', () => {
    let property

    beforeEach(() => {
      property = game.state.properties.find((p) => p.owner === p2.token)
      game.subscribe(() => property = game.getProperty(property.name))
    })

    it('The property must be owned by the player', () => {
      assert.throws(() => {
        game.mortgageProperty(p1.token, property.name)
      }, isMonopolyError)

      assert.ok(!property.isMortgaged)
    })

    it('The property must not already be mortgaged', () => {
      game.mortgageProperty(p2.token, property.name)

      assert.throws(() => {
        game.mortgageProperty(p2.token, property.name)
      }, isMonopolyError)
    })

    it('The property must not have any improvements', () => {
      game.improveProperty(p2.token, property.name)

      assert.throws(() => {
        game.mortgageProperty(p2.token, property.name)
      }, isMonopolyError)

      assert.ok(!property.isMortgaged)
    })

    it('Tha bank must have a sufficient balance', () => {
      game.collectMoney(p1.token, game.state.bank)

      assert.throws(() => {
        game.mortgageProperty(p2.token, property.name)
      }, isMonopolyError)

      assert.ok(!property.isMortgaged)
    })

    it('The bank\'s balance should be decreased by the mortgage', () => {
      let bank = game.state.bank

      game.mortgageProperty(p2.token, property.name)

      assert.equal(game.state.bank, bank - property.mortgage)
    })

    it('The player\'s balance should be increased by the mortgage', () => {
      let bal = p2.balance

      game.mortgageProperty(p2.token, property.name)

      assert.equal(p2.balance, bal + property.mortgage)
    })

    it('The property should be mortgaged', () => {
      game.mortgageProperty(p2.token, property.name)

      assert.ok(property.isMortgaged)
    })
  })

  describe('#unmortgageProperty()', () => {
    let property

    beforeEach(() => {
      property = game.state.properties.find((p) => p.isMortgaged)
      game.subscribe(() => property = game.getProperty(property.name))
    })

    it('The property must be owned by the player', () => {
      assert.throws(() => {
        game.unmortgageProperty(p2.token, property.name)
      }, isMonopolyError)

      assert.ok(property.isMortgaged)
    })

    it('The property must be mortgaged', () => {
      property = game.state.properties.find((p) => p.owner === p2.token)

      assert.throws(() => {
        game.unmortgageProperty(p2.token, property.name)
      }, isMonopolyError)

      assert.ok(!property.isMortgaged)
    })

    it('The player must have a sufficient balance', () => {
      game.payBank(p3.token, p3.balance)

      assert.throws(() => {
        game.unmortgageProperty(p3.token, property.name)
      }, isMonopolyError)

      assert.ok(property.isMortgaged)
    })

    it('The player\'s balance should be decreased by the mortgage plus interest', () => {
      let bal = p3.balance

      game.unmortgageProperty(p3.token, property.name)

      assert.equal(p3.balance, bal - (property.mortgage + property.interest))
    })

    it('The bank\'s balance should be increased by the mortgage plus interest', () => {
      let bank = game.state.bank

      game.unmortgageProperty(p3.token, property.name)

      assert.equal(game.state.bank, bank + (property.mortgage + property.interest))
    })

    it('The player should be able to pay the mortgage without interest', () => {
      let bank = game.state.bank
      let bal = p3.balance

      game.unmortgageProperty(p3.token, property.name, true)

      assert.equal(p3.balance, bal - property.mortgage)
      assert.equal(game.state.bank, bal + property.mortgage)
    })

    it('The property should not be mortgaged', () => {
      game.unmortgageProperty(p3.token, property.name)

      assert.ok(!property.isMortgaged)
    })
  })

  describe('#makeTrade()', () => {
    let property1, property2

    beforeEach(() => {
      property1 = game.state.properties.find((p) => p.owner === p2.token)
      property2 = game.state.properties.find((p) => p.owner === p3.token)

      game.subscribe(() => {
        property1 = game.getProperty(property1.name)
        property2 = game.getProperty(property2.name)
      })
    })

    it('The properties must be owned by the players', () => {
      assert.throws(() => {
        game.makeTrade({
          player: p1.token,
          properties: [property1.name]
        }, {
          player: p3.token,
          properties: [property2.name]
        })
      }, isMonopolyError)

      assert.equal(property1.owner, p2.token)
      assert.equal(property2.owner, p3.token)
    })

    it('The properties must not have any improvements', () => {
      let property2 = game.state.properties.find((p) => p.owner === p1.token)

      assert.throws(() => {
        game.makeTrade({
          player: p1.token,
          properties: [property2]
        }, {
          player: p2.token,
          properties: [property1]
        })
      }, isMonopolyError)

      assert.equal(property1.owner, p2.token)
      assert.equal(property2.owner, p1.token)
    })

    it('The players should have sufficient balances', () => {
      game.payBank(p2.token, p2.balance)

      assert.throws(() => {
        game.makeTrade({
          player: p2.token,
          properties: [property1.name]
        }, {
          player: p3.token,
          properties: [property2.name]
        })
      }, isMonopolyError)

      assert.equal(property1.owner, p2.token)
      assert.equal(property2.owner, p3.token)
    })

    it('The players\' balances should be increased/decreased by the net value', () => {
      let bal1 = p2.balance
      let bal2 = p3.balance

      game.makeTrade({
        player: p2.token,
        properties: [property1.name],
        money: 100
      }, {
        player: p3.token,
        properties: [property2.name],
        money: 200
      })

      assert.equal(p2.balance, bal1 - 100 + 200 - property2.interest)
      assert.equal(p3.balance, bal2 + 100 - 200)
    })

    it('The properties\' owners should be switched', () => {
      game.makeTrade({
        player: p2.token,
        properties: [property1.name]
      }, {
        player: p3.token,
        properties: [property2.name]
      })

      assert.equal(property1.owner, p3.token)
      assert.equal(property2.owner, p2.token)
    })
  })

  describe('#claimBankruptcy()', () => {
    let properties, bal

    beforeEach(() => {
      properties = game.state.properties.filter((p) => p.owner === p1.token)

      game.subscribe(() => {
        properties = properties.map((p) => game.getProperty(p.name))
      })
    })

    it('The player\'s properties should be unimproved', () => {
      game.claimBankruptcy(p1.token, p2.token)

      properties.forEach((p) => assert.equal(p.buildings, 0))
    })

    it('The beneficiary should recieve the player\'s balance plus improvement values', () => {
      let bal1 = p1.balance
      let bal2 = p2.balance
      let value = properties.reduce((v, p) => {
        return v + (p.buildings * Math.round(p.build * game.config.buildingRate))
      }, 0)

      game.claimBankruptcy(p1.token, p2.token)

      assert.equal(p2.balance, bal2 + bal1 + value)
    })

    it('The beneficiary should become the properties\' owner', () => {
      game.claimBankruptcy(p1.token, p2.token)

      properties.forEach((p) => assert.equal(p.owner, p2.token))
    })

    it('The bank should be allowed to be the beneficiary', () => {
      let bal = p1.balance
      let bank = game.state.bank

      game.claimBankruptcy(p1.token, 'bank')

      assert.equal(game.state.bank, bank + bal)
      properties.forEach((p) => assert.equal(p.owner, 'bank'))
    })

    it('The player should be bankrupt', () => {
      game.claimBankruptcy(p1.token, p2.token)

      assert.ok(p1.isBankrupt)
      assert.equal(p1.balance, 0)
      properties.forEach((p) => assert.notEqual(p.owner, p1.token))
    })
  })

  describe('#undo()', () => {
    let property

    beforeEach(() => {
      property = game.state.properties.find((p) => p.owner === p2.token)
      game.subscribe(() => property = game.getProperty(property.name))
    })

    it('The game should be reset to the specified state', () => {
      let entryID, bal = p2.balance

      game.payBank(p2.token, 100)
      entryID = game.state.entry

      game.mortgageProperty(p2.token, property.name)

      assert.ok(property.isMortgaged)
      assert.notEqual(p2.balance, bal)

      game.undo(entryID)

      assert.ok(!property.isMortgaged)
      assert.equal(p2.balance, bal)
    })
  })

  describe('#getPlayer()', () => {

    it('should get a player by token', () => {
      let player = game.getPlayer(p1.token)
      assert.equal(player.name, p1.name)
    })
  })

  describe('#getProperty()', () => {

    it('should get a property by name', () => {
      let property = game.state.properties[0]
      let prop = game.getProperty(property.name)
      assert.equal(prop, property)
    })
  })
})
