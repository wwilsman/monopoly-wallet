import { setupApplication } from '../helpers';

import TransferPropertyInteractor from '../interactors/transfer-property';
import DashboardInteractor from '../interactors/dashboard';

describe('TransferPropertyScreen', () => {
  const transfer = new TransferPropertyInteractor();
  const dashboard = new DashboardInteractor();

  setupApplication(async function () {
    await this.grm.mock({
      room: 't35tt',
      players: [
        { token: 'top-hat' },
        { token: 'automobile' },
        { token: 'thimble' }
      ],
      properties: [
        { id: 'baltic-avenue', owner: 'top-hat' }
      ]
    });

    this.ls.data.room = 't35tt',
    this.ls.data.player = { name: 'PLAYER 1', token: 'top-hat' };
    await transfer.visit('/t35tt/baltic-avenue/transfer');
  });

  it('shows the transfter property screen', async () => {
    await transfer
      .assert.exists()
      .percySnapshot('transfer');
  });

  it('shows the room code', async () => {
    await transfer
      .assert.roomCode('T35TT');
  });

  it('shows a transfer icon and heading', async () => {
    await transfer
      .assert.heading.text('TRANSFER')
      .assert.heading.icon('transfer');
  });

  it('shows a back button linked to the properties screen', async () => {
    await transfer
      .assert.backBtn.exists()
      .assert.backBtn.attribute('href', '/t35tt/properties');
  });

  it('goes to the properties screen when clicking the back button', async () => {
    await transfer
      .backBtn.click()
      .assert.location('/t35tt/properties')
      .assert.not.exists();
  });

  it('has the first other player selected by default', async () => {
    await transfer
      .assert.recipient('automobile').selected();
  });

  it('shows the property card', async () => {
    await transfer
      .assert.property('BALTIC AVENUE');
  });

  it('can choose another player', async () => {
    await transfer
      .recipient('thimble').select()
      .assert.recipient('thimble').selected()
      .percySnapshot('other player chosen');
  });

  it('has a submit button', async () => {
    await transfer
      .assert.submit.exists();
  });

  it('navigates to the dashboard after transferring', async () => {
    await transfer
      .submit.click();
    await dashboard
      .assert.exists()
      .assert.toast.message('PLAYER 2 received Baltic Avenue')
      .assert.summary.property('baltic-avenue').not.exists()
      .assert.card(0).property('baltic-avenue').exists();
    await transfer
      .percySnapshot('after transfer');
  });
});
