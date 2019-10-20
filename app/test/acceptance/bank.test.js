import { setupApplication } from '../helpers';

import BankInteractor from '../interactors/bank';
import DashboardInteractor from '../interactors/dashboard';

describe('BankScreen', () => {
  const bank = new BankInteractor();
  const dashboard = new DashboardInteractor();

  setupApplication(async function () {
    await this.grm.mock({
      room: 't35tt',
      players: [
        { token: 'top-hat' },
        { token: 'automobile' }
      ],
      properties: [
        { group: 'orange', owner: 'top-hat' }
      ]
    });

    this.ls.data.room = 't35tt',
    this.ls.data.player = { name: 'PLAYER 1', token: 'top-hat' };
    await bank.visit();
  });

  it('shows the bank screen', async () => {
    await bank
      .assert.exists()
      .percySnapshot();
  });

  it('shows the room code', async () => {
    await bank
      .assert.roomCode('T35TT');
  });

  it('shows a bank icon and heading', async () => {
    await bank
      .assert.heading.text('BANK')
      .assert.heading.icon('bank');
  });

  it('shows a back button linked to the dashboard', async () => {
    await bank
      .assert.backBtn.exists()
      .assert.backBtn.attribute('href', '/t35tt');
  });

  it('goes to the dashboard when clicking the back button', async () => {
    await bank
      .backBtn.click()
      .assert.location('/t35tt')
      .assert.not.exists();
  });

  it('shows a link to the transfer screen', async () => {
    await bank.links(0).only()
      .assert.text('TRANSFER')
      .assert.icon('transfer')
      .assert.attribute('href', '/t35tt/transfer');
  });

  it('shows a link to the properties screen', async () => {
    await bank.links(1).only()
      .assert.text('PROPERTIES')
      .assert.icon('bank')
      .assert.attribute('href', '/t35tt/properties');
  });

  it('shows a button for claiming bankruptcy', async () => {
    await bank.links(2).only()
      .assert.text('BANKRUPT')
      .assert.icon('currency');
  });

  it('shows a bankruptcy modal after clicking the bankrupt button', async () => {
    await bank
      .links(2).click()
      .assert.bankrupt.exists()
      .assert.bankrupt.heading.text('BANKRUPT')
      .assert.bankrupt.heading.icon('currency')
      .assert.bankrupt.players().count(2)
      .assert.bankrupt.players('bank').exists()
      .assert.bankrupt.players('automobile').exists()
      .assert.bankrupt.submitBtn.exists()
      .percySnapshot('bankrupt modal');
  });

  it('goes to the dashboard after claiming bankruptcy', async () => {
    await bank
      .links(2).click()
      .bankrupt.submitBtn.click();
    await dashboard
      .assert.exists()
      .assert.toast.message('YOU went bankrupt');
    await bank
      .percySnapshot('after bankruptcy');
  });

  it('can choose another player as the beneficiary', async () => {
    await bank
      .links(2).click()
      .bankrupt.players('automobile').click()
      .percySnapshot('bankrupt modal beneficiary')
      .bankrupt.submitBtn.click();
    await dashboard
      .assert.exists()
      .assert.toast.message('PLAYER 2 bankrupt YOU');
    await bank
      .percySnapshot('after benficiary bankruptcy');
  });
});
