import expect from 'expect';
import { setupForTesting } from '../helpers';

describe('renting properties', () => {
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
        { id: 'baltic-avenue', owner: 'top-hat' },
        { group: 'lightblue', owner: 'top-hat', monopoly: true, buildings: 1 },
        { id: 'oriental-avenue', buildings: 2 },
        { id: 'connecticut-avenue', buildings: 3 },
        { id: 'vermont-avenue', owner: 'top-hat' },
        { id: 'states-avenue', owner: 'top-hat', mortgaged: true },
        { group: 'yellow', owner: 'automobile', monopoly: true },
        { group: 'red', owner: 'automobile', monopoly: true, buildings: 4 },
        { id: 'illinois-avenue', buildings: 5 },
        { group: 'railroad', owner: 'top-hat' },
        { id: 'short-line', owner: 'automobile' },
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
    await expect(socket3.send('property:rent', 'baltic-avenue'))
      .rejects.toThrow('no response');
  });

  it('transfers the rent for a single property', async () => {
    let { rent } = game.properties['baltic-avenue'];
    expect(game).toHaveProperty('players.top-hat.balance', 1500);
    expect(game).toHaveProperty('players.automobile.balance', 1500);
    [game] = await socket2.send('property:rent', 'baltic-avenue');
    expect(game).toHaveProperty('players.top-hat.balance', 1500 + rent[0]);
    expect(game).toHaveProperty('players.automobile.balance', 1500 - rent[0]);
  });

  it('transfers the rent for a monopoly property', async () => {
    let { rent } = game.properties['atlantic-avenue'];
    expect(game).toHaveProperty('players.top-hat.balance', 1500);
    expect(game).toHaveProperty('players.automobile.balance', 1500);
    [game] = await socket1.send('property:rent', 'atlantic-avenue');
    expect(game).toHaveProperty('players.top-hat.balance', 1500 - rent[0] * 2);
    expect(game).toHaveProperty('players.automobile.balance', 1500 + rent[0] * 2);
  });

  it('transfers the rent for a property with a house', async () => {
    let { rent } = game.properties['vermont-avenue'];
    expect(game).toHaveProperty('players.top-hat.balance', 1500);
    expect(game).toHaveProperty('players.automobile.balance', 1500);
    [game] = await socket2.send('property:rent', 'vermont-avenue');
    expect(game).toHaveProperty('players.top-hat.balance', 1500 + rent[1]);
    expect(game).toHaveProperty('players.automobile.balance', 1500 - rent[1]);
  });

  it('transfers the rent for a property with 2 houses', async () => {
    let { rent } = game.properties['oriental-avenue'];
    expect(game).toHaveProperty('players.top-hat.balance', 1500);
    expect(game).toHaveProperty('players.automobile.balance', 1500);
    [game] = await socket2.send('property:rent', 'oriental-avenue');
    expect(game).toHaveProperty('players.top-hat.balance', 1500 + rent[2]);
    expect(game).toHaveProperty('players.automobile.balance', 1500 - rent[2]);
  });

  it('transfers the rent for a property with 3 houses', async () => {
    let { rent } = game.properties['connecticut-avenue'];
    expect(game).toHaveProperty('players.top-hat.balance', 1500);
    expect(game).toHaveProperty('players.automobile.balance', 1500);
    [game] = await socket2.send('property:rent', 'connecticut-avenue');
    expect(game).toHaveProperty('players.top-hat.balance', 1500 + rent[3]);
    expect(game).toHaveProperty('players.automobile.balance', 1500 - rent[3]);
  });

  it('transfers the rent for a property with 4 houses', async () => {
    let { rent } = game.properties['indiana-avenue'];
    expect(game).toHaveProperty('players.top-hat.balance', 1500);
    expect(game).toHaveProperty('players.automobile.balance', 1500);
    [game] = await socket1.send('property:rent', 'indiana-avenue');
    expect(game).toHaveProperty('players.top-hat.balance', 1500 - rent[4]);
    expect(game).toHaveProperty('players.automobile.balance', 1500 + rent[4]);
  });

  it('transfers the rent for a property with a hotel', async () => {
    let { rent } = game.properties['illinois-avenue'];
    expect(game).toHaveProperty('players.top-hat.balance', 1500);
    expect(game).toHaveProperty('players.automobile.balance', 1500);
    [game] = await socket1.send('property:rent', 'illinois-avenue');
    expect(game).toHaveProperty('players.top-hat.balance', 1500 - rent[5]);
    expect(game).toHaveProperty('players.automobile.balance', 1500 + rent[5]);
  });

  it('transfers the rent for a single railraod', async () => {
    let { rent } = game.properties['short-line'];
    expect(game).toHaveProperty('players.top-hat.balance', 1500);
    expect(game).toHaveProperty('players.automobile.balance', 1500);
    [game] = await socket1.send('property:rent', 'short-line');
    expect(game).toHaveProperty('players.top-hat.balance', 1500 - rent[0]);
    expect(game).toHaveProperty('players.automobile.balance', 1500 + rent[0]);
  });

  it('transfers the rent for multiple railraods', async () => {
    let { rent } = game.properties['reading-railroad'];
    expect(game).toHaveProperty('players.top-hat.balance', 1500);
    expect(game).toHaveProperty('players.automobile.balance', 1500);
    [game] = await socket2.send('property:rent', 'reading-railroad');
    expect(game).toHaveProperty('players.top-hat.balance', 1500 + rent[2]);
    expect(game).toHaveProperty('players.automobile.balance', 1500 - rent[2]);
  });

  it('transfers the rent for a utility', async () => {
    let { rent } = game.properties['water-works'];
    expect(game).toHaveProperty('players.top-hat.balance', 1500);
    expect(game).toHaveProperty('players.automobile.balance', 1500);
    [game] = await socket1.send('property:rent', 'water-works', 7);
    expect(game).toHaveProperty('players.top-hat.balance', 1500 - rent[0] * 7);
    expect(game).toHaveProperty('players.automobile.balance', 1500 + rent[0] * 7);
  });

  it('responds with a notice describing the action', async () => {
    expect(game).toHaveProperty('notice', null);
    [game] = await socket2.send('property:rent', 'baltic-avenue');
    expect(game).toHaveProperty('notice.id', 'property.paid-rent');
    expect(game).toHaveProperty('notice.message', 'PLAYER 2 paid PLAYER 1 rent for Baltic Avenue');
  });

  it('notifies active players of changes', async () => {
    socket2.send('property:rent', 'baltic-avenue');
    [game] = await socket1.expect('game:update');
    expect(game).toHaveProperty('notice.id', 'property.paid-rent');
    expect(game).toHaveProperty('notice.message', 'PLAYER 2 paid PLAYER 1 rent for Baltic Avenue');
  });

  it('receives an error when the property is own property', async () => {
    await expect(socket1.send('property:rent', 'baltic-avenue'))
      .rejects.toThrow('You own Baltic Avenue');
  });

  it('receives an error when the property is not owned', async () => {
    await expect(socket1.send('property:rent', 'boardwalk'))
      .rejects.toThrow('Boardwalk is unowned');
  });

  it('receives an error when the property is mortgaged', async () => {
    await expect(socket2.send('property:rent', 'states-avenue'))
      .rejects.toThrow('States Avenue is mortgaged');
  });

  it('receives an error when the player balance is insufficient', async function () {
    await this.grm.mock({ id: 't35tt', players: [{ token: 'automobile', balance: 10 }]});
    await expect(socket2.send('property:rent', 'connecticut-avenue'))
      .rejects.toThrow('Insufficient balance');
  });
});
