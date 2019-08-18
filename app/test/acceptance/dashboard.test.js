import { setupApplication } from '../helpers';

import DashboardInteractor from '../interactors/dashboard';
import BankInteractor from '../interactors/bank';

describe('DashboardScreen', () => {
  const dashboard = new DashboardInteractor();

  setupApplication(async function () {
    await this.grm.mock({
      room: 't35tt',
      players: [
        { token: 'top-hat', balance: 1290 },
        { token: 'automobile', balance: 1300 }
      ],
      properties: [
        { id: 'oriental-avenue', owner: 'top-hat' },
        { id: 'kentucky-avenue', owner: 'top-hat' },
        { group: 'yellow', owner: 'automobile' }
      ]
    });

    this.ls.data.room = 't35tt';
    this.ls.data.player = { name: 'PLAYER 1', token: 'top-hat' };

    await dashboard.visit();
  });

  it('shows the player dashboard', async () => {
    await dashboard
      .assert.exists()
      .percySnapshot();
  });

  it('shows the room code', async () => {
    await dashboard
      .assert.roomCode('T35TT');
  });

  it('shows the player name and token', async () => {
    await dashboard
      .assert.heading.text('PLAYER 1')
      .assert.heading.icon('top-hat');
  });

  it('shows the player balance', async () => {
    await dashboard
      .assert.summary.balance('1,290');
  });

  it('shows the player properties', async () => {
    await dashboard.summary.only()
      .assert.groups(10)
      .assert.property('oriental-avenue').exists();
  });

  it('shows the correct property group color', async () => {
    let colors = await dashboard.get('state.config.groupColors');

    await dashboard.summary.only()
      .assert.property('oriental-avenue').group('lightblue')
      .assert.property('oriental-avenue').color(colors.lightblue)
      .assert.property('kentucky-avenue').group('red')
      .assert.property('kentucky-avenue').color(colors.red);
  });

  it('shows other players\' summaries', async () => {
    let colors = await dashboard.get('state.config.groupColors');

    await dashboard
      .assert.card().count(1)
      .assert.card(0).property().count(3)
      .assert.card(0).name('PLAYER 2')
      .assert.card(0).token('automobile')
      .assert.card(0).property('ventnor-avenue').group('yellow')
      .assert.card(0).property('ventnor-avenue').color(colors.yellow);
  });

  it('shows a bank button', async () => {
    await dashboard
      .assert.bankBtn.exists();
  });

  describe('clicking the bank button', async () => {
    const bank = new BankInteractor();

    beforeEach(async () => {
      await dashboard
        .bankBtn.click();
    });

    it('goes to the bank screen', async () => {
      await bank
        .assert.exists()
        .assert.location('/t35tt/bank');
    });

    it('goes back to the dashboard after clicking back', async () => {
      await bank
        .assert.exists()
        .backBtn.click();
      await dashboard
        .assert.exists()
        .assert.location('/t35tt');
    });
  });
});
