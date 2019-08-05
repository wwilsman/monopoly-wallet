import expect from 'expect';
import { setupForTesting } from '../helpers';

describe('transferring properties', () => {
  let game, socket1, socket2;

  setupForTesting(async function () {
    game = await this.grm.mock({
      id: 't35tt',
      players: [
        { token: 'top-hat' },
        { token: 'automobile' }
      ],
      properties: [
        { group: 'lightblue', owner: 'top-hat', monopoly: true },
        { group: 'red', owner: 'top-hat', monopoly: true },
        { id: 'baltic-avenue', owner: 'top-hat', mortgaged: true },
        { id: 'illinois-avenue', buildings: 1 }
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
    await expect(socket3.send('property:transfer', 'connecticut-avenue', 'automobile'))
      .rejects.toThrow('no response');
  });

  it('transfers the property to the other player', async () => {
    expect(game).toHaveProperty('properties.connecticut-avenue.owner', 'top-hat');
    [game] = await socket1.send('property:transfer', 'connecticut-avenue', 'automobile');
    expect(game).toHaveProperty('properties.connecticut-avenue.owner', 'automobile');
  });

  it('updates the monopoly status of transferred properties', async () => {
    expect(game).toHaveProperty('properties.oriental-avenue.monopoly', true);
    expect(game).toHaveProperty('properties.connecticut-avenue.monopoly', true);
    [game] = await socket1.send('property:transfer', 'connecticut-avenue', 'automobile');
    expect(game).toHaveProperty('properties.oriental-avenue.monopoly', false);
    expect(game).toHaveProperty('properties.connecticut-avenue.monopoly', false);
    [game] = await socket2.send('property:transfer', 'connecticut-avenue', 'top-hat');
    expect(game).toHaveProperty('properties.oriental-avenue.monopoly', true);
    expect(game).toHaveProperty('properties.connecticut-avenue.monopoly', true);
  });

  it('responds with a notice describing the action', async () => {
    expect(game).toHaveProperty('notice', null);
    [game] = await socket1.send('property:transfer', 'connecticut-avenue', 'automobile');
    expect(game).toHaveProperty('notice.id', 'property.transfer');
    expect(game).toHaveProperty('notice.message', 'PLAYER 2 received Connecticut Avenue');
  });

  it('notifies active players of changes', async () => {
    socket1.send('property:transfer', 'connecticut-avenue', 'automobile');
    [game] = await socket2.expect('game:update');
    expect(game).toHaveProperty('notice.id', 'property.transfer');
    expect(game).toHaveProperty('notice.message', 'PLAYER 2 received Connecticut Avenue');
  });

  it('responds with an error when the other player cannot be found', async () => {
    await expect(socket1.send('property:transfer', 'connecticut-avenue', 'thimble'))
      .rejects.toThrow('Cannot find player with token "thimble"');
  });

  it('responds with an error when the property is not owned by the player', async () => {
    await expect(socket2.send('property:transfer', 'connecticut-avenue', 'automobile'))
      .rejects.toThrow('You do not own Connecticut Avenue');
  });

  it('responds with an error when the property is already owned by the other player', async () => {
    await expect(socket1.send('property:transfer', 'connecticut-avenue', 'top-hat'))
      .rejects.toThrow('You own Connecticut Avenue');
  });

  it('responds with an error when the property is mortgaged', async () => {
    await expect(socket1.send('property:transfer', 'baltic-avenue', 'automobile'))
      .rejects.toThrow('Baltic Avenue is mortgaged');
  });

  it('responds with an error when a monopoly has improvements', async () => {
    await expect(socket1.send('property:transfer', 'kentucky-avenue', 'automobile'))
      .rejects.toThrow('Illinois Avenue is improved');
  });
});
