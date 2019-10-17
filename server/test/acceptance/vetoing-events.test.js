import expect from 'expect';
import { setupForTesting } from '../helpers';

describe('vetoing events', () => {
  let socket1, socket2, game;

  setupForTesting(async function () {
    game = await this.grm.mock({
      room: 't35tt',
      config: {
        pollTimeout: 50
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
    await expect(socket3.send('game:veto', 'not-applicable'))
      .rejects.toThrow('no response');
  });

  it('polls existing players before vetoing', async () => {
    [game] = await socket1.send('property:buy', 'boardwalk', 1);

    socket1.expect('poll:new').then(([pid, message]) => {
      expect(pid).toEqual(expect.any(String));
      expect(message).toEqual('PLAYER 2 vetos when "PLAYER 1 purchased Boardwalk"');
      socket1.send('poll:vote', pid, true);
    });

    expect(game).toHaveProperty('notice.message', 'PLAYER 1 purchased Boardwalk');
    [game] = await socket2.send('game:veto', game.timestamp);
    expect(game).toHaveProperty('notice', null);
  });

  it('responds with an error when existing players vote no', async () => {
    [game] = await socket1.send('property:buy', 'boardwalk', 1);

    socket1.expect('poll:new').then(([pid]) => (
      socket1.send('poll:vote', pid, false)
    ));

    await expect(socket2.send('game:veto', game.timestamp))
      .rejects.toThrow('Your friends did not agree to veto');
  });

  it('responds with an error when existing players do not vote in time', async () => {
    [game] = await socket1.send('property:buy', 'boardwalk', 1);

    await expect(socket2.send('game:veto', game.timestamp))
      .rejects.toThrow('Your friends did not agree to veto');
  });

  it('notifies players and reverts the game state', async () => {
    [game] = await socket1.send('property:buy', 'boardwalk', 1);

    socket2.send('game:veto', game.timestamp);
    socket1.expect('poll:new').then(([pid]) => (
      socket1.send('poll:vote', pid, true)
    ));

    expect(game).toHaveProperty('notice.message', 'PLAYER 1 purchased Boardwalk');
    expect(game).toHaveProperty('properties.boardwalk.owner', 'top-hat');
    expect(game).toHaveProperty('players.top-hat.balance', 1499);

    [game] = await socket1.expect('game:revert');

    expect(game).toHaveProperty('notice', null);
    expect(game).toHaveProperty('properties.boardwalk.owner', 'bank');
    expect(game).toHaveProperty('players.top-hat.balance', 1500);
  });

  it('responds with an error when there is no corresponding game state', async () => {
    await expect(socket1.send('game:veto', game.timestamp))
      .rejects.toThrow('No matching event found');
  });

  it('can revert multiple events', async () => {
    [game] = await socket1.send('property:buy', 'boardwalk', 1);

    expect(game).toHaveProperty('notice.message', 'PLAYER 1 purchased Boardwalk');
    expect(game).toHaveProperty('properties.boardwalk.owner', 'top-hat');
    expect(game).toHaveProperty('players.top-hat.balance', 1499);
    let timestamp = game.timestamp;

    [game] = await socket1.send('property:buy', 'park-place', 1);

    expect(game).toHaveProperty('notice.message', 'PLAYER 1 purchased Park Place');
    expect(game).toHaveProperty('properties.park-place.owner', 'top-hat');
    expect(game).toHaveProperty('players.top-hat.balance', 1498);

    socket2.send('game:veto', timestamp);
    socket1.expect('poll:new').then(([pid]) => {
      return socket1.send('poll:vote', pid, true);
    });

    [game] = await socket1.expect('game:revert');

    expect(game).toHaveProperty('notice', null);
    expect(game).toHaveProperty('properties.park-place.owner', 'bank');
    expect(game).toHaveProperty('properties.boardwalk.owner', 'bank');
    expect(game).toHaveProperty('players.top-hat.balance', 1500);
  });
});
