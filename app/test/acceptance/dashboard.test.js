import { setupApplication, mockGame } from '../helpers';

import DashboardInteractor from '../interactors/dashboard';

describe('DashboardScreen', () => {
  const dashboard = new DashboardInteractor();

  setupApplication(async () => {
    await mockGame({ state: {
      players: [
        { token: 'top-hat', balance: 1290 },
        { token: 'automobile', balance: 1300 }
      ],
      properties: [
        { id: 'oriental-avenue', owner: 'top-hat' },
        { id: 'kentucky-avenue', owner: 'top-hat' },
        { group: 'yellow', owner: 'automobile' }
      ]
    }});

    localStorage.data.app = {
      room: dashboard.room.id,
      player: { name: 'PLAYER 1', token: 'top-hat' }
    };

    await dashboard.visit()
      .assert.exists();
  });

  it('shows the player dashboard', async () => {
    await dashboard
      .assert.exists()
      .percySnapshot();
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
    let colors = dashboard.state.config.groupColors;

    await dashboard.summary.only()
      .assert.property('oriental-avenue').group('lightblue')
      .assert.property('oriental-avenue').color(colors.lightblue)
      .assert.property('kentucky-avenue').group('red')
      .assert.property('kentucky-avenue').color(colors.red);
  });

  it('shows other players\' summaries', async () => {
    let colors = dashboard.state.config.groupColors;

    await dashboard
      .assert.card().count(1)
      .assert.card(0).property().count(3)
      .assert.card(0).name('PLAYER 2')
      .assert.card(0).token('automobile')
      .assert.card(0).property('ventnor-avenue').group('yellow')
      .assert.card(0).property('ventnor-avenue').color(colors.yellow);
  });
});
