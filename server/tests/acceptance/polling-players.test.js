import expect from 'expect';
import { setupForTesting } from '../helpers';

describe('polling a room', () => {
  let socket1, socket2, socket3, poll;

  setupForTesting(async function () {
    await this.grm.mock({
      id: 't35tt',
      config: {
        pollTimeout: 50
      },
      players: [
        { token: 'top-hat' },
        { token: 'automobile' }
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

    socket3 = await this.socket([
      ['room:connect', 't35tt']
    ]);

    poll = this.grm.rooms['t35tt'].poll('test');
  });

  it('polls only players that have joined the game', async () => {
    await Promise.all([
      socket1.expect('poll:new').then(([pid, message]) => {
        expect(pid).toEqual(expect.any(String));
        expect(message).toEqual('notice.test');
        return socket1.send('poll:vote', pid, true);
      }),

      socket2.expect('poll:new').then(([pid, message]) => {
        expect(pid).toEqual(expect.any(String));
        expect(message).toEqual('notice.test');
        return socket2.send('poll:vote', pid, true);
      }),

      expect(socket3.expect('poll:new'))
        .rejects.toThrow('no response')
    ]);

    await expect(poll).resolves.toBe(true);
  });

  it('resolves false when at least half of players vote no', async () => {
    await Promise.all([
      socket1.expect('poll:new').then(([pid]) => {
        return socket1.send('poll:vote', pid, false);
      }),

      socket2.expect('poll:new').then(([pid]) => {
        return socket2.send('poll:vote', pid, true);
      })
    ]);

    await expect(poll).resolves.toBe(false);
  });

  it('resolves false when not enough players vote in time', async () => {
    await expect(poll).resolves.toBe(false);
  });
});
