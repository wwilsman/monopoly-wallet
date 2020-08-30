import { setupApplication } from '../helpers';

import DashboardScreen from '../interactors/dashboard';
import BankScreen from '../interactors/bank';

describe('Dashboard Screen', () => {
  setupApplication(async function () {
    await this.grm.mock({
      room: 't35tt',
      players: [
        { token: 'top-hat', balance: 1290 },
        { token: 'automobile', balance: 1300 },
        { token: 'thimble', balance: 0, bankrupt: true },
        { token: 'battleship' }
      ],
      properties: [
        { id: 'oriental-avenue', owner: 'top-hat' },
        { id: 'kentucky-avenue', owner: 'top-hat' },
        { group: 'yellow', owner: 'automobile' }
      ]
    });

    this.ls.data.room = 't35tt';
    this.ls.data.player = { name: 'PLAYER 1', token: 'top-hat' };

    await DashboardScreen().visit();
  });

  it('shows the player dashboard', async () => {
    await DashboardScreen()
      .assert.exists();
  });

  it('shows the room code', async () => {
    await DashboardScreen()
      .assert.roomCode('T35TT');
  });

  it('shows the player balance', async () => {
    await DashboardScreen()
      .assert.summary.balance('1,290');
  });

  it('shows the player properties', async () => {
    await DashboardScreen()
      .assert.summary.groups(10)
      .assert.summary.property('oriental-avenue').exists();
  });

  it('shows the correct property group color', async () => {
    let colors = await DashboardScreen().get('config.groupColors');

    await DashboardScreen()
      .assert.summary.property('oriental-avenue').group('lightblue')
      .assert.summary.property('oriental-avenue').color(colors.lightblue)
      .assert.summary.property('kentucky-avenue').group('red')
      .assert.summary.property('kentucky-avenue').color(colors.red);
  });

  it('shows a bankrupt notice when the player is bankrupt', async function() {
    await this.grm.mock({
      room: 't35tt',
      players: [
        { token: 'top-hat', bankrupt: true }
      ]
    });

    await DashboardScreen()
      .assert.summary.bankrupt();
  });

  it('shows other players\' summaries', async () => {
    let colors = await DashboardScreen().get('config.groupColors');

    await DashboardScreen()
      .assert.card().count(3)
      .assert.card(1).property().count(3)
      .assert.card(1).name('PLAYER 2')
      .assert.card(1).token('automobile')
      .assert.card(1).property('ventnor-avenue').group('yellow')
      .assert.card(1).property('ventnor-avenue').color(colors.yellow)
      .assert.card(2).name('PLAYER 4')
      .assert.card(2).token('battleship')
      .assert.card(2).text('NO OWNED PROPERTIES')
      .assert.card(3).name('PLAYER 3')
      .assert.card(3).token('thimble')
      .assert.card(3).text('BANKRUPT');
  });

  it('links to other players\' properties', async () => {
    await DashboardScreen()
      .assert.card(1).name('PLAYER 2')
      .assert.card(1).token('automobile')
      .assert.card(1).linkTo('/t35tt/automobile/properties');
  });

  it('shows a bank button', async () => {
    await DashboardScreen()
      .assert.bankButton.exists();
  });

  describe('clicking the bank button', async () => {
    beforeEach(async () => {
      await DashboardScreen()
        .bankButton.click();
    });

    it('goes to the bank screen', async () => {
      await BankScreen()
        .assert.exists()
        .assert.location('/t35tt/bank');
    });

    it('goes back to the DashboardScreen() after clicking back', async () => {
      await BankScreen()
        .assert.exists()
        .backButton.click();
      await DashboardScreen()
        .assert.exists()
        .assert.location('/t35tt');
    });
  });
});
