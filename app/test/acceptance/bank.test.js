import { setupApplication } from '../helpers';

import BankInteractor from '../interactors/bank';
import DashboardInteractor from '../interactors/dashboard';

describe('BankScreen', () => {
  const bank = new BankInteractor();
  let config;

  setupApplication(async function () {
    ({ config } = await this.grm.mock({
      room: 't35tt',
      players: [
        { token: 'top-hat' }
      ]
    }));

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

  describe.skip('transfering funds', () => {
    let dashboard = new DashboardInteractor();

    it('shows a transfer heading', async () => {
      await bank.headings(0).only()
        .assert.text('TRANSFER');
    });

    it('shows a default withdrawl amount for passing go', async () => {
      await bank.transfer.only()
        .assert.deposit.not.checked()
        .assert.amount(`${config.passGoAmount}`);
    });

    it('shows a default deposit amount for paying to get out a jail', async () => {
      await bank.transfer.only()
        .deposit.check()
        .assert.deposit.checked()
        .assert.amount(`${config.payJailAmount}`);
      await bank.percySnapshot('deposit');
    });

    it('can enter a custom amount', async () => {
      await bank.transfer.only()
        .input.type('250')
        .assert.deposit.not.checked()
        .assert.amount('250')
        .deposit.check()
        .assert.deposit.checked()
        .assert.amount('250');
      await bank.percySnapshot('custom transfer');
    });

    it('restores the default withdrawl on blur when the amount is 0', async () => {
      await bank.transfer.only()
        .input.focus()
        .input.type('0')
        .assert.amount('0')
        .input.blur()
        .assert.amount(`${config.passGoAmount}`);
    });

    it('restores the default deposit on blur when the amount is 0', async () => {
      await bank.transfer.only()
        .deposit.check()
        .input.focus()
        .input.type('0')
        .assert.deposit.checked()
        .assert.amount('0')
        .input.blur()
        .assert.amount(`${config.payJailAmount}`);
    });

    it('clears the default withdrawl amount after pressing backspace', async () => {
      await bank.transfer.only()
        .assert.amount(`${config.passGoAmount}`)
        .input.press('Backspace')
        .assert.amount('0');
    });

    it('clears the default deposit amount after pressing backspace', async () => {
      await bank.transfer.only()
        .deposit.check()
        .assert.amount(`${config.payJailAmount}`)
        .input.press('Backspace')
        .assert.deposit.checked()
        .assert.amount('0');
    });

    it('has a submit button', async () => {
      await bank.transfer.only()
        .assert.submit.exists();
    });

    it('navigates to the dashbaord after withdrawing', async () => {
      await bank.transfer.only()
        .submit.click();
      await dashboard
        .assert.exists()
        .assert.summary.balance('1,700');
      await bank.percySnapshot('after withdrawl');
    });

    it('navigates to the dashbaord after depositing', async () => {
      await bank.transfer.only()
        .deposit.check()
        .submit.click();
      await dashboard
        .assert.exists()
        .assert.summary.balance('1,450');
      await bank.percySnapshot('after deposit');
    });

    it('navigates to the dashbaord after transfering a custom amount', async () => {
      await bank.transfer.only()
        .input.type('500')
        .deposit.check()
        .submit.click();
      await dashboard
        .assert.exists()
        .assert.summary.balance('1,000');
    });
  });
});
