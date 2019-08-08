import expect from 'expect';
import { setupForTesting } from '../helpers';

describe('unmortgaging properties', () => {
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
        { id: 'baltic-avenue', owner: 'top-hat', mortgaged: true },
        { id: 'atlantic-avenue', owner: 'automobile' }
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
    await expect(socket3.send('property:unmortgage', 'baltic-avenue'))
      .rejects.toThrow('no response');
  });

  it('marks the property as unmortgaged', async () => {
    expect(game).toHaveProperty('properties.baltic-avenue.mortgaged', true);
    [game] = await socket1.send('property:unmortgage', 'baltic-avenue');
    expect(game).toHaveProperty('properties.baltic-avenue.mortgaged', false);
  });

  it('transfers the mortgage price plus interest from the player to the bank', async () => {
    let { price } = game.properties['baltic-avenue'];
    let principle = price * game.config.mortgageRate;
    price = principle + (principle * game.config.interestRate);

    expect(game).toHaveProperty('bank', 10000);
    expect(game).toHaveProperty('players.top-hat.balance', 1500);
    [game] = await socket1.send('property:unmortgage', 'baltic-avenue');
    expect(game).toHaveProperty('bank', 10000 + price);
    expect(game).toHaveProperty('players.top-hat.balance', 1500 - price);
  });

  it('responds with a notice describing the action', async () => {
    expect(game).toHaveProperty('notice', null);
    [game] = await socket1.send('property:unmortgage', 'baltic-avenue');
    expect(game).toHaveProperty('notice.id', 'property.unmortgaged');
    expect(game).toHaveProperty('notice.message', 'PLAYER 1 unmortgaged Baltic Avenue');
  });

  it('notifies active players of changes', async () => {
    socket1.send('property:unmortgage', 'baltic-avenue');
    [game] = await socket2.expect('game:update');
    expect(game).toHaveProperty('notice.id', 'property.unmortgaged');
    expect(game).toHaveProperty('notice.message', 'PLAYER 1 unmortgaged Baltic Avenue');
  });

  it('receives an error when the property is not owned by the player', async () => {
    await expect(socket1.send('property:unmortgage', 'boardwalk'))
      .rejects.toThrow('Boardwalk is unowned');
    await expect(socket2.send('property:unmortgage', 'baltic-avenue'))
      .rejects.toThrow('You do not own Baltic Avenue');
  });

  it('receives an error when the property is not mortgaged', async () => {
    await expect(socket2.send('property:unmortgage', 'atlantic-avenue'))
      .rejects.toThrow('Atlantic Avenue is not mortgaged');
  });

  it('receives an error when the player balance is insufficient', async function () {
    await this.grm.mock({ room: 't35tt', players: [{ token: 'top-hat', balance: 10 }] });
    await expect(socket1.send('property:unmortgage', 'baltic-avenue'))
      .rejects.toThrow('Insufficient balance');
  });
});
