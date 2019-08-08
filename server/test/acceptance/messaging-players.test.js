import expect from 'expect';
import { setupForTesting } from '../helpers';

describe('messaging players', () => {
  let socket1, socket2;

  setupForTesting(async function () {
    await this.grm.mock({
      room: 't35tt',
      players: [
        { token: 'top-hat' },
        { token: 'automobile' },
        { token: 'thimble' }
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
    await expect(socket3.send('message:send', 'top-hat', 'have not joined'))
      .rejects.toThrow('no response');
  });

  it('sends a message to another player', async () => {
    let sent = socket1.send('message:send', 'automobile', 'hey there');
    let [from, message] = await socket2.expect('message:receive');
    await expect(sent).resolves.toBeDefined();
    expect(from).toEqual('top-hat');
    expect(message).toEqual('hey there');
  });

  it('responds with an error when the player is not connected', async () => {
    await expect(socket1.send('message:send', 'thimble', 'sup'))
      .rejects.toThrow('PLAYER 3 is not connected');
  });

  it('responds with an error when the player does not exist', async () => {
    await expect(socket1.send('message:send', 'battleship', 'hello?'))
      .rejects.toThrow('Cannot find player with token "battleship"');
  });
});
