import expect from 'expect';
import { setupForTesting } from '../helpers';

describe('creating a new room', () => {
  let socket;

  setupForTesting(async function () {
    socket = await this.socket();
  });

  it('creates a new game', async () => {
    let [response] = await socket.send('room:create');
    expect(response).toHaveProperty('room', expect.any(String));
    expect(response).toHaveProperty('theme', 'classic');
    expect(response).toHaveProperty('config', expect.any(Object));
  });

  it('automatically connects to the new game', async () => {
    let [{ room }] = await socket.send('room:create');
    await expect(socket.send('room:connect', room)).rejects.toThrow('Player already joined');
  });
});
