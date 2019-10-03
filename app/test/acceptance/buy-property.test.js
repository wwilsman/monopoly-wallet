import { setupApplication } from '../helpers';

import TransferPropertyInteractor from '../interactors/transfer-property';
import DashboardInteractor from '../interactors/dashboard';

describe('BuyPropertyScreen', () => {
  const transfer = new TransferPropertyInteractor();
  const dashboard = new DashboardInteractor();

  setupApplication(async function () {
    await this.grm.mock({
      room: 't35tt',
      players: [
        { token: 'top-hat' }
      ]
    });

    this.ls.data.room = 't35tt',
    this.ls.data.player = { name: 'PLAYER 1', token: 'top-hat' };
    await transfer.visit('/t35tt/oriental-avenue/buy');
  });

  it('shows the buy property screen', async () => {
    await transfer
      .assert.exists()
      .percySnapshot('buy');
  });

  it('shows the room code', async () => {
    await transfer
      .assert.roomCode('T35TT');
  });

  it('shows a transfer icon and purchase heading', async () => {
    await transfer
      .assert.heading.text('PURCHASE')
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

  it('shows a default amount for the property\'s price', async () => {
    await transfer
      .assert.amount('100');
  });

  it('shows the property card', async () => {
    await transfer
      .assert.property('ORIENTAL AVENUE');
  });

  it('can enter a custom amount', async () => {
    await transfer
      .input.type('30')
      .assert.amount('30')
      .percySnapshot('buy custom amount');
  });

  it('restores the defaults amount on blur when the amount is 0', async () => {
    await transfer
      .input.focus()
      .input.type('0')
      .assert.amount('0')
      .input.blur()
      .assert.amount('100');
  });

  it('clears the default withdrawl amount after pressing backspace', async () => {
    await transfer
      .assert.amount('100')
      .input.press('Backspace')
      .assert.amount('0');
  });

  it('has a submit button', async () => {
    await transfer
      .assert.submit.exists();
  });

  it('navigates to the dashboard after purchasing', async () => {
    await transfer
      .input.type('20')
      .submit.click();
    await dashboard
      .assert.exists()
      .assert.toast.message('YOU purchased Oriental Avenue')
      .assert.summary.balance('1,480');
    await transfer
      .percySnapshot('after purchase');
  });
});
