import expect from 'expect';
import { setupForTesting } from '../helpers';

describe('connecting to a room', () => {
  let socket1, socket2;

  setupForTesting(async function () {
    await this.grm.mock({
      room: 't35tt',
      players: [
        { token: 'top-hat' },
        { token: 'automobile' }
      ]
    });

    await this.socket([
      ['room:connect', 't35tt'],
      ['game:join', 'PLAYER 1', 'top-hat']
    ]);

    socket1 = await this.socket();
    socket2 = await this.socket([
      ['room:connect', 't35tt']
    ]);
  });

  it('receives basic room and game info', async () => {
    let [response] = await socket1.send('room:connect', 't35tt');
    expect(response).toHaveProperty('room', 't35tt');
    expect(response).toHaveProperty('theme', 'classic');
    expect(response).toHaveProperty('active', ['top-hat']);
    expect(response).toHaveProperty('players', expect.objectContaining({
      'top-hat': expect.objectContaining({ name: 'PLAYER 1', token: 'top-hat' })
    }));
    expect(response).toHaveProperty('config', expect.objectContaining({
      playerTokens: expect.any(Array)
    }));
  });

  it('updates connected players to new players', async () => {
    await socket1.send('room:connect', 't35tt');
    socket2.send('game:join', 'PLAYER 2', 'automobile');

    let [response] = await socket1.expect('room:sync');
    expect(response).toHaveProperty('active', ['top-hat', 'automobile']);
    expect(response).toHaveProperty('players', expect.objectContaining({
      'top-hat': expect.objectContaining({ name: 'PLAYER 1', token: 'top-hat' }),
      'automobile': expect.objectContaining({ name: 'PLAYER 2', token: 'automobile' })
    }));
  });

  it('receives an error response for a non-existing game', async () => {
    await expect(socket1.send('room:connect', 'f4k3e')).rejects.toThrow('Game not found');
  });

  it('throws an error when connecting more than once', async () => {
    await expect(socket1.send('room:connect', 't35tt')).resolves.toBeDefined();
    await expect(socket1.send('room:connect', 't35tt')).rejects.toThrow('Player already joined');
  });
});
