import expect from 'expect';
import { setupForTesting } from '../helpers';

describe('claiming bankruptcy', () => {
  let game, socket1, socket2;

  setupForTesting(async function () {
    game = await this.grm.mock({
      room: 't35tt',
      players: [
        { token: 'top-hat' },
        { token: 'automobile' }
      ],
      properties: [
        { group: 'yellow', owner: 'top-hat', monopoly: true },
        { group: 'lightblue', owner: 'automobile' },
        { id: 'oriental-avenue', owner: 'top-hat' }
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
    await expect(socket3.send('player:transfer', 'bank', 100))
      .rejects.toThrow('no response');
  });

  it('marks the player as bankrupt', async () => {
    expect(game).toHaveProperty('players.top-hat.bankrupt', false);
    [game] = await socket1.send('player:bankrupt', 'automobile');
    expect(game).toHaveProperty('players.top-hat.bankrupt', true);
  });

  it('transfers the player balance to the beneficiary', async () => {
    expect(game).toHaveProperty('players.top-hat.balance', 1500);
    expect(game).toHaveProperty('players.automobile.balance', 1500);
    [game] = await socket1.send('player:bankrupt', 'automobile');
    expect(game).toHaveProperty('players.top-hat.balance', 0);
    expect(game).toHaveProperty('players.automobile.balance', 3000);
  });

  it('transfers owned properties to the beneficiary', async () => {
    expect(game).toHaveProperty('properties.ventnor-avenue.owner', 'top-hat');
    expect(game).toHaveProperty('properties.ventnor-avenue.monopoly', true);
    expect(game).toHaveProperty('properties.oriental-avenue.owner', 'top-hat');
    expect(game).toHaveProperty('properties.oriental-avenue.monopoly', false);
    expect(game).toHaveProperty('properties.vermont-avenue.owner', 'automobile');
    expect(game).toHaveProperty('properties.vermont-avenue.monopoly', false);
    [game] = await socket1.send('player:bankrupt', 'automobile');
    expect(game).toHaveProperty('properties.ventnor-avenue.owner', 'automobile');
    expect(game).toHaveProperty('properties.ventnor-avenue.monopoly', true);
    expect(game).toHaveProperty('properties.oriental-avenue.owner', 'automobile');
    expect(game).toHaveProperty('properties.oriental-avenue.monopoly', true);
    expect(game).toHaveProperty('properties.vermont-avenue.owner', 'automobile');
    expect(game).toHaveProperty('properties.vermont-avenue.monopoly', true);
  });

  it('responds with a notice describing the action', async () => {
    expect(game).toHaveProperty('notice', null);
    [game] = await socket1.send('player:bankrupt', 'automobile');
    expect(game).toHaveProperty('notice.id', 'player.other-bankrupt');
    expect(game).toHaveProperty('notice.message', 'PLAYER 2 bankrupt PLAYER 1');
    [game] = await socket2.send('player:bankrupt', 'bank');
    expect(game).toHaveProperty('notice.id', 'player.bankrupt');
    expect(game).toHaveProperty('notice.message', 'PLAYER 2 went bankrupt');
  });

  it('notifies active players of changes', async () => {
    socket1.send('player:bankrupt', 'bank');
    [game] = await socket2.expect('game:update');
    expect(game).toHaveProperty('notice.id', 'player.bankrupt');
    expect(game).toHaveProperty('notice.message', 'PLAYER 1 went bankrupt');
  });

  it('responds with an error when the other player cannot be found', async () => {
    await expect(socket1.send('player:bankrupt', 'thimble'))
      .rejects.toThrow('Cannot find player with token "thimble"');
  });

  it('responds with an error when benefiting yourself', async () => {
    await expect(socket1.send('player:bankrupt', 'top-hat'))
      .rejects.toThrow("You can't play with yourself");
  });
});
