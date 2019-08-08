import expect from 'expect';
import { setupForTesting } from '../helpers';

describe('transferring balances', () => {
  let game, socket1, socket2;

  setupForTesting(async function () {
    game = await this.grm.mock({
      room: 't35tt',
      players: [
        { token: 'top-hat' },
        { token: 'automobile' }
      ],
      config: {
        bankStart: 10000,
        playerStart: 1000
      }
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

  it('transfers an amount to the bank', async () => {
    expect(game).toHaveProperty('bank', 10000);
    expect(game).toHaveProperty('players.top-hat.balance', 1000);
    [game] = await socket1.send('player:transfer', 'bank', 100);
    expect(game).toHaveProperty('bank', 10100);
    expect(game).toHaveProperty('players.top-hat.balance', 900);
  });

  it('transfers an amount from the bank', async () => {
    expect(game).toHaveProperty('bank', 10000);
    expect(game).toHaveProperty('players.top-hat.balance', 1000);
    [game] = await socket1.send('player:transfer', 'bank', -100);
    expect(game).toHaveProperty('bank', 9900);
    expect(game).toHaveProperty('players.top-hat.balance', 1100);
  });

  it('transfers an amount to another player', async () => {
    expect(game).toHaveProperty('players.automobile.balance', 1000);
    expect(game).toHaveProperty('players.top-hat.balance', 1000);
    [game] = await socket1.send('player:transfer', 'automobile', 100);
    expect(game).toHaveProperty('players.automobile.balance', 1100);
    expect(game).toHaveProperty('players.top-hat.balance', 900);
  });

  it('responds with a notice describing the action', async () => {
    expect(game).toHaveProperty('notice', null);
    [game] = await socket1.send('player:transfer', 'bank', 100);
    expect(game).toHaveProperty('notice.id', 'player.paid-amount');
    expect(game).toHaveProperty('notice.message', 'PLAYER 1 paid the bank $100');
    [game] = await socket1.send('player:transfer', 'bank', -100);
    expect(game).toHaveProperty('notice.id', 'player.received-amount');
    expect(game).toHaveProperty('notice.message', 'PLAYER 1 received $100');
    [game] = await socket1.send('player:transfer', 'automobile', 100);
    expect(game).toHaveProperty('notice.id', 'player.paid-other');
    expect(game).toHaveProperty('notice.message', 'PLAYER 1 paid PLAYER 2 $100');
  });

  it('notifies active players of changes', async () => {
    socket1.send('player:transfer', 'bank', 100);
    [game] = await socket2.expect('game:update');
    expect(game).toHaveProperty('notice.id', 'player.paid-amount');
    expect(game).toHaveProperty('notice.message', 'PLAYER 1 paid the bank $100');
  });

  it('responds with an error when the bank is insufficient', async () => {
    await expect(socket1.send('player:transfer', 'bank', -11000))
      .rejects.toThrow('Bank funds are insufficient');
  });

  it('responds with an error when the player has an insufficient balance', async () => {
    await expect(socket1.send('player:transfer', 'automobile', 2000))
      .rejects.toThrow('Insufficient balance');
  });

  it('responds with an error when trying to transfer from another player', async () => {
    await expect(socket1.send('player:transfer', 'automobile', -100))
      .rejects.toThrow('Amount must not be negative');
  });

  it('responds with an error when the other player cannot be found', async () => {
    await expect(socket1.send('player:transfer', 'thimble', 100))
      .rejects.toThrow('Cannot find player with token "thimble"');
  });
});
