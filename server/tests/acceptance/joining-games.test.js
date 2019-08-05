import expect from 'expect';
import { setupForTesting } from '../helpers';

describe('joining a room', () => {
  let game, socket1, socket2;

  setupForTesting(async function () {
    game = await this.grm.mock({
      id: 't35tt',
      config: {
        bankStart: 10000,
        playerStart: 1000,
        pollTimeout: 50
      }
    });

    socket1 = await this.socket([['room:connect', 't35tt']]);
    socket2 = await this.socket([['room:connect', 't35tt']]);
  });

  it('does not recieve a response when not connected', async function () {
    let socket3 = await this.socket();
    await expect(socket3.send('game:join', 'PLAYER 1', 'top-hat'))
      .rejects.toThrow('no response');
  });

  it('joins a game with no other players', async () => {
    expect(game).toHaveProperty('players.all', []);
    expect(game).not.toHaveProperty('players.top-hat');
    [game] = await socket1.send('game:join', 'PLAYER 1', 'top-hat');
    expect(game).toHaveProperty('active', ['top-hat']);
    expect(game).toHaveProperty('id', 't35tt');
    expect(game).toHaveProperty('players.all', ['top-hat']);
    expect(game).toHaveProperty('players.top-hat', {
      name: 'PLAYER 1',
      token: 'top-hat',
      balance: 1000,
      bankrupt: false
    });
  });

  it('deducts the starting balance from the bank', async () => {
    expect(game).toHaveProperty('bank', 10000);
    [game] = await socket1.send('game:join', 'PLAYER 1', 'top-hat');
    expect(game).toHaveProperty('bank', 9000);
  });

  it('responds with a notice describing the action', async () => {
    expect(game).toHaveProperty('notice', null);
    [game] = await socket1.send('game:join', 'PLAYER 1', 'top-hat');
    expect(game).toHaveProperty('notice.id', 'player.joined');
    expect(game).toHaveProperty('notice.message', 'PLAYER 1 joined the game');
  });

  it('polls existing players before joining', async () => {
    await socket1.send('game:join', 'PLAYER 1', 'top-hat');

    socket1.expect('poll:new').then(([pid, message]) => {
      expect(pid).toEqual(expect.any(String));
      expect(message).toEqual('PLAYER 2 would like to join');
      socket1.send('poll:vote', pid, true);
    });

    let [response] = await socket2.send('game:join', 'PLAYER 2', 'automobile');
    expect(response).toHaveProperty('id', 't35tt');
  });

  it('responds with an error when existing players vote no', async () => {
    await socket1.send('game:join', 'PLAYER 1', 'top-hat');

    socket1.expect('poll:new').then(([pid]) => (
      socket1.send('poll:vote', pid, false)
    ));

    await expect(socket2.send('game:join', 'PLAYER 2', 'automobile'))
      .rejects.toThrow('Sorry, your friends hate you');
  });

  it('responds with an error when existing players do not vote in time', async () => {
    await socket1.send('game:join', 'PLAYER 1', 'top-hat');
    await expect(socket2.send('game:join', 'PLAYER 2', 'automobile'))
      .rejects.toThrow('Sorry, your friends hate you');
  });

  it('notifies active players of a new player', async () => {
    await socket1.send('game:join', 'PLAYER 1', 'top-hat');
    socket2.send('game:join', 'PLAYER 2', 'automobile');

    socket1.expect('poll:new').then(([pid]) => (
      socket1.send('poll:vote', pid, true)
    ));

    [game] = await socket1.expect('game:update');
    expect(game).toHaveProperty('notice.id', 'player.joined');
    expect(game).toHaveProperty('notice.message', 'PLAYER 2 joined the game');
  });

  it('responds with an error when the token is invalid', async () => {
    await expect(socket1.send('game:join', 'PLAYER 1', 'wat'))
      .rejects.toThrow('Invalid token');
  });

  it('responds with an error when the token is already in use', async () => {
    await socket1.send('game:join', 'PLAYER 1', 'top-hat');
    await expect(socket2.send('game:join', 'PLAYER 2', 'top-hat'))
      .rejects.toThrow('Player already joined');
  });

  it('responds with an error when the bank is insufficient', async function () {
    await this.grm.mock({ id: 't35tt', bank: 500 });
    await expect(socket1.send('game:join', 'PLAYER 1', 'top-hat'))
      .rejects.toThrow('Bank funds are insufficient');
  });
});
