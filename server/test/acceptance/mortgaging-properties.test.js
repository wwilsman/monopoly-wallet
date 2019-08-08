import expect from 'expect';
import { setupForTesting } from '../helpers';

describe('mortgaging properties', () => {
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
        { group: 'lightblue', owner: 'top-hat', monopoly: true },
        { id: 'oriental-avenue', buildings: 1 },
        { id: 'atlantic-avenue', owner: 'automobile' },
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
    await expect(socket3.send('property:mortgage', 'baltic-avenue'))
      .rejects.toThrow('no response');
  });

  it('marks the property as mortgaged', async () => {
    expect(game).toHaveProperty('properties.atlantic-avenue.mortgaged', false);
    [game] = await socket2.send('property:mortgage', 'atlantic-avenue');
    expect(game).toHaveProperty('properties.atlantic-avenue.mortgaged', true);
  });

  it('transfers the mortgage price of the property from the bank to the player', async () => {
    let { price } = game.properties['atlantic-avenue'];
    price = price * game.config.mortgageRate;

    expect(game).toHaveProperty('bank', 10000);
    expect(game).toHaveProperty('players.automobile.balance', 1500);
    [game] = await socket2.send('property:mortgage', 'atlantic-avenue');
    expect(game).toHaveProperty('bank', 10000 - price);
    expect(game).toHaveProperty('players.automobile.balance', 1500 + price);
  });

  it('responds with a notice describing the action', async () => {
    expect(game).toHaveProperty('notice', null);
    [game] = await socket2.send('property:mortgage', 'atlantic-avenue');
    expect(game).toHaveProperty('notice.id', 'property.mortgaged');
    expect(game).toHaveProperty('notice.message', 'PLAYER 2 mortgaged Atlantic Avenue');
  });

  it('notifies active players of changes', async () => {
    socket2.send('property:mortgage', 'atlantic-avenue');
    [game] = await socket1.expect('game:update');
    expect(game).toHaveProperty('notice.id', 'property.mortgaged');
    expect(game).toHaveProperty('notice.message', 'PLAYER 2 mortgaged Atlantic Avenue');
  });

  it('receives an error when the property is not owned by the player', async () => {
    await expect(socket1.send('property:mortgage', 'boardwalk'))
      .rejects.toThrow('Boardwalk is unowned');
    await expect(socket1.send('property:mortgage', 'atlantic-avenue'))
      .rejects.toThrow('You do not own Atlantic Avenue');
  });

  it('receives an error when the property is already mortgaged', async () => {
    await expect(socket1.send('property:mortgage', 'baltic-avenue'))
      .rejects.toThrow('Baltic Avenue is mortgaged');
  });

  it('receives an error when the bank is insufficient', async function () {
    await this.grm.mock({ room: 't35tt', bank: 10 });
    await expect(socket2.send('property:mortgage', 'atlantic-avenue'))
      .rejects.toThrow('Bank funds are insufficient');
  });

  it('receives an error when any property in the group is improved', async () => {
    await expect(socket1.send('property:mortgage', 'connecticut-avenue'))
      .rejects.toThrow('Oriental Avenue is improved');
  });
});
