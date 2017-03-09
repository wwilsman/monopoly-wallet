import assert from 'assert'
import MonopolyGame from '../lib/game'
import testGame from './state'

const { config, state:initialState } = testGame
const { playerTokens:tokens } = config

function isMonopolyError(err) {
  return err.name === 'MonopolyError'
}

describe('Game', () => {
  let game, p1, p2, p3

  beforeEach(() => {
    [p1, p2, p3] = initialState.players
    game = new MonopolyGame(config, initialState)
    
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

    it('The player cannot use a token already in use', () => {
      const playerCount = game.state.players.length

      assert.throws(() => {
        game.join(p4.name, tokens[0])
      }, isMonopolyError)

      assert.equal(game.state.players.length, playerCount)
    })

    it('The bank must have a sufficient balance', () => {
      game.join(p4.name, p4.token)

      assert.equal(game.state.bank, 0)

      assert.throws(() => {
        game.join('player 5')
      }, isMonopolyError)

      assert.equal(game.state.bank, 0)
    })

    it('The player\'s balance should be set to the start amount', () => {
      assert.ok(!p4.balance)

      game.join(p4.name, p4.token)

      assert.equal(p4.balance, game.config.playerStart)
    })

    it('The bank\'s balance should be decreased by the start amount', () => {
      assert.equal(game.state.bank, game.config.playerStart)

      game.join(p4.name, p4.token)

      assert.equal(game.state.bank, 0)
    })
  })

  describe('#getPlayer()', () => {

    it('should get a player by token', () => {
      const player = game.getPlayer(p1.token)

      assert.equal(player.name, p1.name)
    })
  })

  describe('#getProperty()', () => {

    it('should get a property by name', () => {
      const property = game.state.properties[0]
      const prop = game.getProperty(property.name)

      assert.equal(prop, property)
    })
  })

  describe('#getPropertyGroup()', () => {

    it('should get properties by group', () => {
      const property = game.state.properties[0]
      const group = game.getPropertyGroup(property.group)

      assert.notEqual(group.indexOf(property), -1)
    })
  })

  describe('#undo()', () => {
    let property

    beforeEach(() => {
      property = game.state.properties.find((p) => p.owner === p2.token)

      game.subscribe(() => {
        property = game.getProperty(property.name)
      })
    })

    it('The game should be reset to the specified state', () => {
      const bal = p2.balance

      game.payBank(p2.token, 100)

      const entryID = game.state.entry

      game.mortgageProperty(p2.token, property.name)

      assert.ok(property.isMortgaged)
      assert.notEqual(p2.balance, bal)

      game.undo(entryID)

      assert.ok(!property.isMortgaged)
      assert.equal(p2.balance, bal)
    })
  })

  describe('Bank', () => {

    describe('#payBank()', () => {

      it('The player must have a sufficient balance', () => {
        game.payBank(p1.token, p1.balance)

        const bank = game.state.bank

        assert.throws(() => {
          game.payBank(p1.token, 100)
        }, isMonopolyError)

        assert.equal(p1.balance, 0)
        assert.equal(game.state.bank, bank)
      })

      it('The amount must not be a negative value', () => {
        const bal = p1.balance
        const bank = game.state.bank

        assert.throws(() => {
          game.payBank(p1.token, -100)
        }, isMonopolyError)

        assert.equal(p1.balance, bal)
        assert.equal(game.state.bank, bank)
      })

      it('The player\'s balance should be decreased by the amount', () => {
        const bal = p1.balance

        game.payBank(p1.token, 100)

        assert.equal(p1.balance, bal - 100)
      })

      it('The bank\'s balance should be increased by the amount', () => {
        const bank = game.state.bank

        game.payBank(p1.token, 100)

        assert.equal(game.state.bank, bank + 100)
      })
    })

    describe('#collectMoney()', () => {

      it('The bank must have a sufficient balance', () => {
        game.collectMoney(p1.token, game.state.bank)

        const bal = p1.balance

        assert.throws(() => {
          game.collectMoney(p1.token, 100)
        }, isMonopolyError)

        assert.equal(p1.balance, bal)
        assert.equal(game.state.bank, 0)
      })

      it('The amount must not be a negative value', () => {
        const bal = p1.balance
        const bank = game.state.bank

        assert.throws(() => {
          game.collectMoney(p1.token, -100)
        }, isMonopolyError)

        assert.equal(p1.balance, bal)
        assert.equal(game.state.bank, bank)
      })

      it('The bank\'s balance should be decreased by a set amount', () => {
        const bank = game.state.bank

        game.collectMoney(p1.token, 100)

        assert.equal(game.state.bank, bank - 100)
      })

      it('The player\'s balance should be increased by a set amount', () => {
        const bal = p1.balance

        game.collectMoney(p1.token, 100)

        assert.equal(p1.balance, bal + 100)
      })
    })
  })

  describe('Players', () => {

    describe('#payPlayer()', () => {

      it('The player must have a sufficient balance', () => {
        const bal = p2.balance

        game.payBank(p1.token, p1.balance)

        assert.throws(() => {
          game.payPlayer(p1.token, p2.token, 100)
        }, isMonopolyError)

        assert.equal(p1.balance, 0)
        assert.equal(p2.balance, bal)
      })

      it('The amount must not be a negative value', () => {
        const bal1 = p1.balance
        const bal2 = p2.balance

        assert.throws(() => {
          game.payPlayer(p1.token, p2.token, -100)
        }, isMonopolyError)

        assert.equal(p1.balance, bal1)
        assert.equal(p2.balance, bal2)
      })

      it('The player\'s balance should be decreased by the amount', () => {
        const bal = p1.balance

        game.payPlayer(p1.token, p2.token, 100)

        assert.equal(p1.balance, bal - 100)
      })

      it('The other player\'s balance should be increased by the amount', () => {
        let bal = p2.balance

        game.payPlayer(p1.token, p2.token, 100)

        assert.equal(p2.balance, bal + 100)
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
        const bal = p1.balance

        game.mortgageProperty(p2.token, property.name)

        assert.throws(() => {
          game.payRent(p1.token, property.name)
        }, isMonopolyError)

        assert.equal(p1.balance, bal)
      })

      it('The rent should be double for monopolies', () => {
        const rent = property.rent[0]
        const bal = p1.balance

        game.payRent(p1.token, property.name)

        assert.equal(p1.balance, bal - (rent * 2))
      })

      it('The rent should scale with improvements', () => {
        const property1 = game.state.properties.find((p) => p.buildings === 5)
        const property2 = game.state.properties.find((p) =>
          p.group === property1.group && p.buildings === 4)

        const rent1 = property1.rent[5]
        const rent2 = property2.rent[4]

        const bal1 = p2.balance
        const bal2 = p3.balance

        game.payRent(p2.token, property1.name)
        game.payRent(p3.token, property2.name)

        assert.equal(p2.balance, bal1 - rent1)
        assert.equal(p3.balance, bal2 - rent2)
      })

      it('The rent for railroads should be based on the amount owned', () => {
        const railroads = game.state.properties.filter((p) =>
          p.owner === p3.token && p.group === 'railroad')

        const rent = railroads[0].rent[0]
        const bal = p1.balance

        game.payRent(p1.token, railroads[0].name)

        assert.equal(p1.balance, bal - (rent * railroads.length))
      })

      it('The rent for utilities should be a multiple of the number rolled', () => {
        const utility = game.state.properties.find((p) =>
          p.owner === p3.token && p.group == 'utility')

        const rent = utility.rent[0]
        const bal = p1.balance

        game.payRent(p1.token, utility.name, 5)

        assert.equal(p1.balance, bal - (rent * 5))
      })

      it('The player must have a sufficient balance', () => {
        game.payBank(p1.token, p1.balance)

        assert.throws(() => {
          game.payRent(p1.token, property.name)
        }, isMonopolyError)

        assert.equal(p1.balance, 0)
      })

      it('The player\'s balance should be decreased by the rent', () => {
        const rent = property.rent[0]
        const bal = p1.balance

        game.payRent(p1.token, property.name)

        assert.equal(p1.balance, bal - (rent * 2))
      })

      it('The owner\'s balance should be increased by the rent', () => {
        const rent = property.rent[0]
        const bal = p2.balance

        game.payRent(p1.token, property.name)

        assert.equal(p2.balance, bal + (rent * 2))
      })
    })

    describe('#claimBankruptcy()', () => {
      let properties

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
        const bal1 = p1.balance
        const bal2 = p2.balance

        const value = properties.reduce((v, p) =>
          v + (p.buildings * Math.round(p.build * game.config.buildingRate)), 0)

        game.claimBankruptcy(p1.token, p2.token)

        assert.equal(p2.balance, bal2 + bal1 + value)
      })

      it('The beneficiary should become the properties\' owner', () => {
        game.claimBankruptcy(p1.token, p2.token)

        properties.forEach((p) => assert.equal(p.owner, p2.token))
      })

      it('The bank should be allowed to be the beneficiary', () => {
        const bal = p1.balance
        const bank = game.state.bank

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
  })

  describe('Properties', () => {

    describe('#buyProperty()', () => {
      let property

      beforeEach(() => {
        property = game.state.properties.find((p) => p.owner === 'bank')

        game.subscribe(() => {
          property = game.getProperty(property.name)
        })
      })

      it('The property must not already be owned', () => {
        const property2 = game.state.properties.find((p) => p.owner !== 'bank')

        assert.throws(() => {
          game.buyProperty(p1.token, property2.name)
        }, isMonopolyError)

        assert.notEqual(property2.owner, 'bank')
      })

      it('The player must have a sufficient balance', () => {
        const bal = p1.balance

        game.payBank(p1.token, bal)

        assert.equal(p1.balance, 0)

        assert.throws(() => {
          game.buyProperty(p1.token, property.name)
        }, isMonopolyError)

        assert.equal(p1.balance, 0)
      })

      it('The purchase amount should default to the property\'s price', () => {
        const bal = p1.balance - property.price

        game.buyProperty(p1.token, property.name)

        assert.equal(p1.balance, bal)
      })

      it('The player\'s balance should be decreased by the amount', () => {
        const bal = p1.balance

        game.buyProperty(p1.token, property.name, 100)

        assert.equal(p1.balance, bal - 100)
      })

      it('The bank\'s balance should be increased by the amount', () => {
        const bank = game.state.bank

        game.buyProperty(p1.token, property.name, 100)

        assert.equal(game.state.bank, bank + 100)
      })

      it('The player should become the property\'s owner', () => {
        game.buyProperty(p1.token, property.name)

        assert.equal(property.owner, p1.token)
      })
    })

    describe('#improveProperty()', () => {
      let property

      beforeEach(() => {
        property = game.state.properties.find((p) => p.owner === p2.token)

        game.subscribe(() => {
          property = game.getProperty(property.name)
        })
      })

      it('The property must be owned by the player', () => {
        assert.throws(() => {
          game.improveProperty(p1.token, property.name)
        }, isMonopolyError)

        assert.equal(property.buildings, 0)
      })

      it('The property must not be a railroad or utility', () => {
        const railroad = game.state.properties.find((p) =>
          p.owner === p3.token && p.group === 'railroad')
        const utility = game.state.properties.find((p) =>
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
        const group = game.getPropertyGroup(property.group)

        group.forEach((p) => game.improveProperty(p2.token, p.name))
        game.improveProperty(p2.token, group[0].name)

        assert.throws(() => {
          game.improveProperty(p2.token, group[1].name)
        }, isMonopolyError)

        const prop = game.getProperty(group[1].name)

        assert.equal(prop.buildings, 1)
      })

      it('The player\'s balance should be decreased by the building cost', () => {
        const cost = property.build
        const bal = p2.balance

        game.improveProperty(p2.token, property.name)

        assert.equal(p2.balance, bal - cost)
      })

      it('The bank\'s balance should be increased by the building cost', () => {
        const cost = property.build
        const bank = game.state.bank

        game.improveProperty(p2.token, property.name)

        assert.equal(game.state.bank, bank + cost)
      })

      it('The available houses/hotels should be decreased by 1', () => {
        const property2 = game.state.properties.find((p) => p.buildings === 4)
        const hotels = game.state.hotels
        const houses = game.state.houses

        game.improveProperty(p2.token, property.name)

        assert.equal(game.state.houses, houses - 1)

        game.improveProperty(p1.token, property2.name)

        assert.equal(game.state.hotels, hotels - 1)
      })

      it('The available houses should increase by 4 if a hotel is needed', () => {
        const property = game.state.properties.find((p) => p.buildings === 4)
        const houses = game.state.houses

        game.improveProperty(p1.token, property.name)

        assert.equal(game.state.houses, houses + 4)
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

        game.subscribe(() => {
          property = game.getProperty(property.name)
        })
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
        const railroad = game.state.properties.find((p) =>
          p.owner === p3.token && p.group === 'railroad')
        const utility = game.state.properties.find((p) =>
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
        const property2 = game.state.properties.find((p) => p.owner === p2.token)

        // the bank will have too few houses to unimprove a hotel
        game.improveProperty(p2.token, property2.name)

        assert.throws(() => {
          game.unimproveProperty(p1.token, property.name)
        }, isMonopolyError)

        assert.equal(property.buildings, 5)
      })

      it('The property\'s group should be minimally unimproved if requested', () => {
        const property2 = game.state.properties.find((p) => p.owner === p2.token)

        // the bank will have too few houses to unimprove a hotel
        game.improveProperty(p2.token, property2.name)

        let group = game.getPropertyGroup(property.group)

        game.unimproveProperty(p1.token, group[0].name, true)

        group = game.getPropertyGroup(property.group)

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
        const value = Math.round(game.config.buildingRate * property.build)
        const bank = game.state.bank

        game.unimproveProperty(p1.token, property.name)

        assert.equal(game.state.bank, bank - value)
      })

      it('The player\'s balance should be increased by the building value', () => {
        const value = Math.round(game.config.buildingRate * property.build)
        const bal = p1.balance

        game.unimproveProperty(p1.token, property.name)

        assert.equal(p1.balance, bal + value)
      })

      it('The value should increase by the building count when unimproving the group', () => {
        const property2 = game.state.properties.find((p) => p.owner === p2.token)

        // the bank will have too few houses to unimprove a hotel
        game.improveProperty(p2.token, property2.name)

        let group = game.getPropertyGroup(property.group)

        const value = Math.round(game.config.buildingRate * property.build) * 2
        const bal = p1.balance

        game.unimproveProperty(p1.token, group[0].name, true)

        group = game.getPropertyGroup(property.group)

        assert.equal(p1.balance, bal + value)
      })

      it('The available houses/hotels should be increased', () => {
        const property2 = game.state.properties.find((p) => p.owner === p2.token)

        game.improveProperty(p2.token, property2.name)

        const houses = game.state.houses
        const hotels = game.state.hotels

        game.unimproveProperty(p2.token, property2.name)

        assert.equal(game.state.houses, houses + 1)

        game.unimproveProperty(p1.token, property.name)

        assert.equal(game.state.hotels, hotels + 1)
      })

      it('The available houses should decrease if a hotel was sold', () => {
        const houses = game.state.houses

        game.unimproveProperty(p1.token, property.name)

        assert.equal(game.state.houses, houses - 4)
      })

      it('The property\'s building count should be decreased', () => {
        game.unimproveProperty(p1.token, property.name)

        assert.equal(property.buildings, 4)
      })

      it('The property\'s group building counts should decrease normally when there are enough houses', () => {
        let group = game.getPropertyGroup(property.group)

        game.unimproveProperty(p1.token, group[0].name, true)

        group = game.getPropertyGroup(property.group)

        assert.equal(group[0].buildings, 4)
        assert.equal(group[1].buildings, 4)
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
        const bank = game.state.bank

        game.mortgageProperty(p2.token, property.name)

        assert.equal(game.state.bank, bank - property.mortgage)
      })

      it('The player\'s balance should be increased by the mortgage', () => {
        const bal = p2.balance

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
        const bal = p3.balance

        game.unmortgageProperty(p3.token, property.name)

        assert.equal(p3.balance, bal - (property.mortgage + property.interest))
      })

      it('The bank\'s balance should be increased by the mortgage plus interest', () => {
        const bank = game.state.bank

        game.unmortgageProperty(p3.token, property.name)

        assert.equal(game.state.bank, bank + (property.mortgage + property.interest))
      })

      it('The player should be able to pay the mortgage without interest', () => {
        const bank = game.state.bank
        const bal = p3.balance

        game.unmortgageProperty(p3.token, property.name, true)

        assert.equal(p3.balance, bal - property.mortgage)
        assert.equal(game.state.bank, bal + property.mortgage)
      })

      it('The property should not be mortgaged', () => {
        game.unmortgageProperty(p3.token, property.name)

        assert.ok(!property.isMortgaged)
      })
    })
  })

  describe('Auctions', () => {
    let property, auction, winning

    beforeEach(() => {
      property = game.state.properties.find((p) => p.owner === 'bank')

      game.subscribe(() => {
        property = game.getProperty(property.name)
        auction = game.state.auction
        winning = auction && auction.bids[0]
      })

      game.auctionProperty(p1.token, property.name)
    })

    describe('#auctionProperty()', () => {

      it('There should only be one auction at a time', () => {
        const property2 = game.state.properties.find((p) =>
          p.owner === 'bank' && p.name !== property.name)
        
        assert.throws(() => {
          game.auctionProperty(p1.token, property2.name)
        }, isMonopolyError)
      })

      it('The property must not be owned', () => {
        property = game.state.properties.find((p) => p.owner === p2.token)

        assert.throws(() => {
          game.auctionProperty(p1.token, property.name)
        }, isMonopolyError)
      })

      it('The property should go up for auction', () => {
        assert.ok(game.state.auction)
        assert.equal(game.state.auction.property, property.name)
      })
    })

    describe('#placeAuctionBid()', () => {

      it('The property must be up for auction', () => {
        const property2 = game.state.properties.find((p) =>
          p.owner === 'bank' && p.name !== property.name)

        assert.throws(() => {
          game.placeAuctionBid(p1.token, property2.name, 1)
        }, isMonopolyError)

        assert.equal(winning.amount, 0)
      })

      it('The player must not have already conceded', () => {
        game.concedeAuction(p1.token, property.name)

        assert.ok(!auction.bids.find((b) => b.player === p1.token))

        assert.throws(() => {
          game.placeAuctionBid(p1.token, property.name, 1)
        }, isMonopolyError)

        assert.equal(winning.amount, 0)
      })

      it('The player must not already be winning', () => {
        game.placeAuctionBid(p1.token, property.name, 1)

        assert.equal(winning.player, p1.token)

        assert.throws(() => {
          game.placeAuctionBid(p1.token, property.name, 2)
        }, isMonopolyError)

        assert.equal(winning.player, p1.token)
        assert.equal(winning.amount, 1)
      })

      it('The bid must be higher than the current bid', () => {
        game.placeAuctionBid(p1.token, property.name, 2)

        assert.equal(winning.amount, 2)

        assert.throws(() => {
          game.placeAuctionBid(p2.token, property.name, 1)
        }, isMonopolyError)

        assert.equal(winning.player, p1.token)
        assert.equal(winning.amount, 2)
      })

      it('The player must have enough money to make the bid', () => {
        assert.throws(() => {
          game.placeAuctionBid(p1.token, property.name, p1.balance + 1)
        }, isMonopolyError)

        assert.equal(winning.amount, 0)
      })

      it('The player should be able to place a bid', () => {
        game.placeAuctionBid(p1.token, property.name, 1)

        assert.equal(winning.player, p1.token)
        assert.equal(winning.amount, 1)
      })
    })

    describe('#concedeAuction()', () => {

      it('The property must be up for auction', () => {
        const property2 = game.state.properties.find((p) =>
          p.owner === 'bank' && p.name !== property.name)

        assert.throws(() => {
          game.concedeAuction(p1.token, property2.name)
        }, isMonopolyError)

        assert.ok(auction.bids.find((b) => b.player === p1.token))
      })

      it('The player can\'t concede more than once', () => {
        game.concedeAuction(p1.token, property.name)

        assert.ok(!auction.bids.find((b) => b.player === p1.token))

        assert.throws(() => {
          game.concedeAuction(p1.token, property.name)
        })
      })

      it('The player should concede from the auction', () => {
        assert.ok(auction.bids.find((b) => b.player === p1.token))

        game.concedeAuction(p1.token, property.name)

        assert.ok(!auction.bids.find((b) => b.player === p1.token))
      })

      it('The last player should win the auction', () => {
        const bal = p1.balance

        game.placeAuctionBid(p1.token, property.name, 1)

        game.concedeAuction(p2.token, property.name)
        game.concedeAuction(p3.token, property.name)

        assert.equal(property.owner, p1.token)
        assert.equal(p1.balance, bal - 1)
        assert.ok(!auction)
      })

      it('The auction should cancel if players concede without bidding', () => {
        game.concedeAuction(p1.token, property.name)
        game.concedeAuction(p2.token, property.name)
        game.concedeAuction(p3.token, property.name)

        assert.equal(property.owner, 'bank')
        assert.ok(!auction)
      })
    })

    describe('#_closeAuction()', () => {

      it('The auction should be cancelled when nobody has bid', () => {
        game._closeAuction()

        assert.equal(property.owner, 'bank')
        assert.ok(!auction)
      })

      it('The highest bidding player should win the auction', () => {
        const bal = p1.balance

        game.placeAuctionBid(p1.token, property.name, 1)

        game._closeAuction()

        assert.equal(property.owner, p1.token)
        assert.equal(p1.balance, bal - 1)
        assert.ok(!auction)
      })
    })
  })

  describe('Trading', () => {
    let property1, property2, trade

    beforeEach(() => {
      property1 = game.state.properties.find((p) => p.owner === p2.token)
      property2 = game.state.properties.find((p) => p.owner === p3.token)

      game.subscribe(() => {
        property1 = game.getProperty(property1.name)
        property2 = game.getProperty(property2.name)
        trade = game.state.trades[0]
      })

      game.makeTrade(p2.token, p3.token, [
        { amount: 100, properties: [property1.name] },
        { amount: 200, properties: [property2.name] }
      ])
    })

    describe('#_validateTrade()', () => {

      it('The properties must be owned by the players', () => {
        assert.throws(() => {
          game._validateTrade({
            players: [p1.token, p3.token],
            [p1.token]: { properties: [property1.name] },
            [p3.token]: { properties: [property2.name] }
          })
        }, isMonopolyError)

        assert.equal(property1.owner, p2.token)
        assert.equal(property2.owner, p3.token)
      })

      it('The properties must not have any improvements', () => {
        property1 = game.state.properties.find((p) => p.owner === p1.token)

        assert.throws(() => {
          game._validateTrade({
            players: [p1.token, p3.token],
            [p1.token]: { properties: [property1.name] },
            [p3.token]: { properties: [property2.name] }
          })
        }, isMonopolyError)

        assert.equal(property1.owner, p1.token)
        assert.equal(property2.owner, p3.token)
      })

      it('The players should have sufficient balances', () => {
        game.payBank(p2.token, p2.balance)

        assert.throws(() => {
          game._validateTrade({
            players: [p2.token, p3.token],
            [p2.token]: { amount: 100, properties: [property1.name] },
            [p3.token]: { properties: [property2.name] }
          })
        }, isMonopolyError)

        assert.equal(property1.owner, p2.token)
        assert.equal(property2.owner, p3.token)
      })
    })

    describe('#makeTrade()', () => {

      it('The player should start a trade with another player', () => {
        assert.ok(trade)
        assert.equal(trade.players[0], p2.token)
        assert.equal(trade.players[1], p3.token)
        assert.deepEqual(trade[p2.token], { amount: 100, properties: [property1.name] })
        assert.deepEqual(trade[p3.token], { amount: 200, properties: [property2.name] })
      })

      it('The players should be able to update a trade', () => {
        game.makeTrade(p3.token, p2.token, [
          { amount: 100, properties: [property2.name] },
          { properties: [property1.name] }
        ])

        assert.equal(trade[p3.token].amount, 100)

        game.makeTrade(p2.token, p3.token, [
          { properties: [property1.name] },
          { amount: 200, properties: [property2.name] }
        ])

        assert.equal(trade[p3.token].amount, 200)
      })
    })

    describe('#cancelTrade()', () => {

      it('There must be a trade to cancel', () => {
        assert.throws(() => {
          game.cancelTrade(p1.token, p2.token)
        }, isMonopolyError)
      })

      it('The player should be able to cancel a trade', () => {
        game.cancelTrade(p2.token, p3.token)
        assert.equal(game.state.trades.length, 0)
      })

      it('The other player should also be able to cancel a trade', () => {
        game.cancelTrade(p3.token, p2.token)
        assert.equal(game.state.trades.length, 0)
      })
    })

    describe('#finalizeTrade()', () => {

      it('There must be a trade to finalize', () => {
        assert.throws(() => {
          game.finalizeTrade(p1.token, p2.token)
        }, isMonopolyError)
      })

      it('The players\' balances should be increased/decreased by the net value', () => {
        const bal1 = p2.balance
        const bal2 = p3.balance

        game.finalizeTrade(p2.token, p3.token)

        assert.equal(p2.balance, bal1 - 100 + 200 - property2.interest)
        assert.equal(p3.balance, bal2 + 100 - 200)
      })

      it('The properties\' owners should be switched', () => {
        game.finalizeTrade(p2.token, p3.token)

        assert.equal(property1.owner, p3.token)
        assert.equal(property2.owner, p2.token)
      })
    })
  })
})
