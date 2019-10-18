import expect from 'expect';
import { setupForTesting } from '../helpers';

describe('buying properties', () => {
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
        { id: 'oriental-avenue', owner: 'top-hat' },
        { id: 'vermont-avenue', owner: 'top-hat' }
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
    await expect(socket3.send('property:buy', 'baltic-avenue'))
      .rejects.toThrow('no response');
  });

  it('transfers ownership of a property', async () => {
    expect(game).toHaveProperty('properties.baltic-avenue.owner', 'bank');
    [game] = await socket1.send('property:buy', 'baltic-avenue');
    expect(game).toHaveProperty('properties.baltic-avenue.owner', 'top-hat');
  });

  it('transfers the price of the property from the player to the bank', async () => {
    let { price } = game.properties['baltic-avenue'];
    expect(game).toHaveProperty('bank', 10000);
    expect(game).toHaveProperty('players.top-hat.balance', 1500);
    [game] = await socket1.send('property:buy', 'baltic-avenue');
    expect(game).toHaveProperty('bank', 10000 + price);
    expect(game).toHaveProperty('players.top-hat.balance', 1500 - price);
  });

  it('transfers an arbitrary amount from the player to the bank', async () => {
    expect(game).toHaveProperty('bank', 10000);
    expect(game).toHaveProperty('players.top-hat.balance', 1500);
    [game] = await socket1.send('property:buy', 'baltic-avenue', 10);
    expect(game).toHaveProperty('bank', 10010);
    expect(game).toHaveProperty('players.top-hat.balance', 1490);
  });

  it('correctly marks properties when completing a monopoly', async () => {
    expect(game).toHaveProperty('properties.oriental-avenue.monopoly', false);
    expect(game).toHaveProperty('properties.vermont-avenue.monopoly', false);
    expect(game).toHaveProperty('properties.connecticut-avenue.monopoly', false);
    [game] = await socket1.send('property:buy', 'connecticut-avenue');
    expect(game).toHaveProperty('properties.oriental-avenue.monopoly', true);
    expect(game).toHaveProperty('properties.vermont-avenue.monopoly', true);
    expect(game).toHaveProperty('properties.connecticut-avenue.monopoly', true);
  });

  it('responds with a notice describing the action', async () => {
    expect(game).toHaveProperty('notice', null);
    [game] = await socket1.send('property:buy', 'baltic-avenue');
    expect(game).toHaveProperty('notice.id', 'property.bought');
    expect(game).toHaveProperty('notice.message', 'PLAYER 1 purchased Baltic Avenue');
  });

  it('notifies active players of changes', async () => {
    socket1.send('property:buy', 'baltic-avenue');
    [game] = await socket2.expect('game:update');
    expect(game).toHaveProperty('notice.id', 'property.bought');
    expect(game).toHaveProperty('notice.message', 'PLAYER 1 purchased Baltic Avenue');
  });

  it('receives an error when specifying a negative amount', async () => {
    await expect(socket2.send('property:buy', 'baltic-avenue', -10))
      .rejects.toThrow('Amount must not be negative');
  });

  it('responds with an error when bankrupt', async () => {
    await socket1.send('player:bankrupt', 'bank');
    await expect(socket1.send('property:buy', 'connecticut-avenue'))
      .rejects.toThrow('Unable to do that while bankrupt');
  });

  it('receives an error when the property is already owned', async () => {
    await expect(socket2.send('property:buy', 'oriental-avenue'))
      .rejects.toThrow('Oriental Avenue is owned by PLAYER 1');
  });

  it('receives an error when the player balance is insufficient', async () => {
    await expect(socket2.send('property:buy', 'boardwalk', 2000))
      .rejects.toThrow('Insufficient balance');
  });
});
