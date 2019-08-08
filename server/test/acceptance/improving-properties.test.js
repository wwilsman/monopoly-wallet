import expect from 'expect';
import { setupForTesting } from '../helpers';

describe('improving properties', () => {
  let socket1, socket2, game;

  setupForTesting(async function () {
    game = await this.grm.mock({
      room: 't35tt',
      config: {
        bankStart: 10000
      },
      players: [
        { token: 'top-hat' },
        { token: 'automobile' }
      ],
      properties: [
        { group: 'lightblue', owner: 'top-hat', monopoly: true },
        { group: 'red', owner: 'top-hat', monopoly: true, buildings: 5 },
        { group: 'magenta', owner: 'automobile', monopoly: true, buildings: 3 },
        { id: 'kentucky-avenue', buildings: 4 },
        { id: 'virginia-avenue', buildings: 4 },
        { id: 'atlantic-avenue', owner: 'automobile' },
        { id: 'ventnor-avenue', owner: 'automobile', mortgaged: true },
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
    await expect(socket3.send('property:improve', 'baltic-avenue'))
      .rejects.toThrow('no response');
  });

  it('increases the building count on a property', async () => {
    expect(game).toHaveProperty('properties.connecticut-avenue.buildings', 0);
    [game] = await socket1.send('property:improve', 'connecticut-avenue');
    expect(game).toHaveProperty('properties.connecticut-avenue.buildings', 1);
  });

  it('ajusts the amount of available houses and hotels', async () => {
    expect(game).toHaveProperty('houses', 32);
    expect(game).toHaveProperty('hotels', 12);
    [game] = await socket1.send('property:improve', 'connecticut-avenue');
    expect(game).toHaveProperty('houses', 31);
    expect(game).toHaveProperty('hotels', 12);
    [game] = await socket1.send('property:improve', 'kentucky-avenue');
    expect(game).toHaveProperty('houses', 35);
    expect(game).toHaveProperty('hotels', 11);
  });

  it('transfers the building cost from the player to the bank', async () => {
    let { cost } = game.properties['connecticut-avenue'];
    expect(game).toHaveProperty('bank', 10000);
    expect(game).toHaveProperty('players.top-hat.balance', 1500);
    [game] = await socket1.send('property:improve', 'connecticut-avenue');
    expect(game).toHaveProperty('bank', 10000 + cost);
    expect(game).toHaveProperty('players.top-hat.balance', 1500 - cost);
  });

  it('responds with a notice describing the action', async () => {
    expect(game).toHaveProperty('notice', null);
    [game] = await socket1.send('property:improve', 'connecticut-avenue');
    expect(game).toHaveProperty('notice.id', 'property.improved');
    expect(game).toHaveProperty('notice.message', 'PLAYER 1 improved Connecticut Avenue');
  });

  it('notifies active players of changes', async () => {
    socket1.send('property:improve', 'connecticut-avenue');
    [game] = await socket2.expect('game:update');
    expect(game).toHaveProperty('notice.id', 'property.improved');
    expect(game).toHaveProperty('notice.message', 'PLAYER 1 improved Connecticut Avenue');
  });

  it('receives an error when the property is not owned by the player', async () => {
    await expect(socket1.send('property:improve', 'boardwalk'))
      .rejects.toThrow('Boardwalk is unowned');
    await expect(socket2.send('property:improve', 'connecticut-avenue'))
      .rejects.toThrow('You do not own Connecticut Avenue');
  });

  it('receives an error when the property is not part of a monopoly', async () => {
    await expect(socket2.send('property:improve', 'atlantic-avenue'))
      .rejects.toThrow('Atlantic Avenue is not a monopoly');
  });

  it('receives an error when the property is a railroad or utility', async () => {
    await expect(socket2.send('property:improve', 'reading-railroad'))
      .rejects.toThrow('Cannot improve a railroad');
    await expect(socket2.send('property:improve', 'water-works'))
      .rejects.toThrow('Cannot improve a utility');
  });

  it('receives an error when the property is mortgaged', async () => {
    await expect(socket2.send('property:improve', 'ventnor-avenue'))
      .rejects.toThrow('Ventnor Avenue is mortgaged');
  });

  it('receives an error when the property is fully improved', async () => {
    await expect(socket1.send('property:improve', 'illinois-avenue'))
      .rejects.toThrow('Illinois Avenue is fully improved');
  });

  it('receives an error when the property is not improved evenly', async () => {
    await expect(socket2.send('property:improve', 'virginia-avenue'))
      .rejects.toThrow('You must build evenly');
  });

  it('receives an error when the player balance is insufficient', async function () {
    await this.grm.mock({ room: 't35tt', players: [{ token: 'automobile', balance: 50 }] });
    await expect(socket2.send('property:improve', 'states-avenue'))
      .rejects.toThrow('Insufficient balance');
  });

  it('receives an error when there is not enough houses or hotels', async function () {
    await this.grm.mock({ room: 't35tt', houses: 0, hotels: 0 });
    await expect(socket2.send('property:improve', 'states-avenue'))
      .rejects.toThrow('Not enough houses');
    await expect(socket1.send('property:improve', 'kentucky-avenue'))
      .rejects.toThrow('Not enough hotels');
  });
});
