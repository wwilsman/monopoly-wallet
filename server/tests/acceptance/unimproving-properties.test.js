import expect from 'expect';
import { setupForTesting } from '../helpers';

describe('unimproving properties', () => {
  let socket1, socket2, game;

  setupForTesting(async function () {
    game = await this.grm.mock({
      id: 't35tt',
      config: {
        bankStart: 10000
      },
      players: [
        { token: 'top-hat' },
        { token: 'automobile' }
      ],
      properties: [
        { group: 'lightblue', owner: 'top-hat', monopoly: true, buildings: 5 },
        { group: 'magenta', owner: 'automobile', monopoly: true },
        { id: 'virginia-avenue', buildings: 1 },
        { id: 'oriental-avenue', buildings: 4 },
        { id: 'reading-railroad', owner: 'automobile' },
        { id: 'water-works', owner: 'automobile' }
      ]
    });

    socket1 = await this.socket([
      ['room:connect', 't35tt'],
      ['game:join', 'PLAYER 1', 'top-hat']
    ]);

    socket2 = await this.socket([
      ['room:connect', 't35tt'],
      ['game:join', 'PLAYER 2', 'automobile']
    ]);
  });

  it('does nothing if the player has not joined', async function () {
    let socket3 = await this.socket([['room:connect', 't35tt']]);
    await expect(socket3.send('property:unimprove', 'baltic-avenue'))
      .rejects.toThrow('no response');
  });

  it('descreases the building count on a property', async () => {
    expect(game).toHaveProperty('properties.connecticut-avenue.buildings', 5);
    [game] = await socket1.send('property:unimprove', 'connecticut-avenue');
    expect(game).toHaveProperty('properties.connecticut-avenue.buildings', 4);
  });

  it('ajusts the amount of available houses and hotels', async () => {
    expect(game).toHaveProperty('houses', 32);
    expect(game).toHaveProperty('hotels', 12);
    [game] = await socket1.send('property:unimprove', 'connecticut-avenue');
    expect(game).toHaveProperty('houses', 28);
    expect(game).toHaveProperty('hotels', 13);
    [game] = await socket2.send('property:unimprove', 'virginia-avenue');
    expect(game).toHaveProperty('houses', 29);
    expect(game).toHaveProperty('hotels', 13);
  });

  it('transfers the building cost adjusted for rate from the bank to the player', async () => {
    let { cost } = game.properties['connecticut-avenue'];
    cost = cost * game.config.buildingRate;

    expect(game).toHaveProperty('bank', 10000);
    expect(game).toHaveProperty('players.top-hat.balance', 1500);
    [game] = await socket1.send('property:unimprove', 'connecticut-avenue');
    expect(game).toHaveProperty('bank', 10000 - cost);
    expect(game).toHaveProperty('players.top-hat.balance', 1500 + cost);
  });

  it('responds with a notice describing the action', async () => {
    expect(game).toHaveProperty('notice', null);
    [game] = await socket1.send('property:unimprove', 'connecticut-avenue');
    expect(game).toHaveProperty('notice.id', 'property.unimproved');
    expect(game).toHaveProperty('notice.message', 'PLAYER 1 unimproved Connecticut Avenue');
  });

  it('notifies active players of changes', async () => {
    socket1.send('property:unimprove', 'connecticut-avenue');
    [game] = await socket2.expect('game:update');
    expect(game).toHaveProperty('notice.id', 'property.unimproved');
    expect(game).toHaveProperty('notice.message', 'PLAYER 1 unimproved Connecticut Avenue');
  });

  it('receives an error when the property is not owned by the player', async () => {
    await expect(socket1.send('property:unimprove', 'boardwalk'))
      .rejects.toThrow('Boardwalk is unowned');
    await expect(socket2.send('property:unimprove', 'connecticut-avenue'))
      .rejects.toThrow('You do not own Connecticut Avenue');
  });

  it('receives an error when the property is not a railraod or utility', async () => {
    await expect(socket2.send('property:unimprove', 'reading-railroad'))
      .rejects.toThrow('Cannot improve a railroad');
    await expect(socket2.send('property:unimprove', 'water-works'))
      .rejects.toThrow('Cannot improve a utility');
  });

  it('receives an error when the property is not improved', async () => {
    await expect(socket2.send('property:unimprove', 'states-avenue'))
      .rejects.toThrow('States Avenue is unimproved');
  });

  it('receives an error when the property is not unimproved evenly', async () => {
    await expect(socket1.send('property:unimprove', 'oriental-avenue'))
      .rejects.toThrow('You must build evenly');
  });

  it('receives an error when the bank is insufficient', async function () {
    await this.grm.mock({ id: 't35tt', bank: 10 });
    await expect(socket1.send('property:unimprove', 'connecticut-avenue'))
      .rejects.toThrow('Bank funds are insufficient');
  });

  it('receives an error when there is not enough houses', async function () {
    await this.grm.mock({ id: 't35tt', houses: 0 });
    await expect(socket1.send('property:unimprove', 'connecticut-avenue'))
      .rejects.toThrow('Not enough houses');
  });
});
