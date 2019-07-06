import { setupApplication, mockGame } from '../helpers';

import BankInteractor from '../interactors/bank';
import DashboardInteractor from '../interactors/dashboard';

describe('BankScreen', () => {
  const bank = new BankInteractor();

  setupApplication(async () => {
    await mockGame({ state: {
      players: [
        { token: 'top-hat' }
      ]
    }});

    localStorage.data.app = {
      room: bank.room.id,
      player: { name: 'PLAYER 1', token: 'top-hat' }
    };

    await bank.visit()
      .assert.exists();
  });

  it('shows the bank screen', async () => {
    await bank
      .assert.exists()
      .percySnapshot();
  });

  it('shows the room code', async () => {
    await bank
      .assert.roomId(bank.room.id.toUpperCase());
  });

  it('shows a bank icon and heading', async () => {
    await bank
      .assert.heading.text('BANK')
      .assert.heading.icon('bank');
  });

  it('shows a back button linked to the dashboard', async () => {
    await bank
      .assert.backBtn.exists()
      .assert.backBtn.attribute('href', `/${bank.room.id}`);
  });

  it('goes to the dashboard when clicking the back button', async () => {
    await bank
      .backBtn.click()
      .assert.location(`/${bank.room.id}`)
      .assert.not.exists();
  });

  describe('transfering funds', () => {
    let dashboard = new DashboardInteractor();

    it('shows a transfer heading', async () => {
      await bank.headings(0).only()
        .assert.text('TRANSFER');
    });

    it('shows a default withdrawl amount for passing go', async () => {
      await bank.transfer.only()
        .assert.deposit.not.checked()
        .assert.amount(`${bank.state.config.passGoAmount}`);
    });

    it('shows a default deposit amount for paying to get out a jail', async () => {
      await bank.transfer.only()
        .deposit.check()
        .assert.deposit.checked()
        .assert.amount(`${bank.state.config.payJailAmount}`);
      await bank.percySnapshot('deposit');
    });

    it('can enter a custom amount', async () => {
      await bank.transfer.only()
        .type('250')
        .assert.deposit.not.checked()
        .assert.amount('250')
        .deposit.check()
        .assert.deposit.checked()
        .assert.amount('250');
      await bank.percySnapshot('custom transfer');
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
        .type('500')
        .deposit.check()
        .submit.click();
      await dashboard
        .assert.exists()
        .assert.summary.balance('1,000');
    });
  });
});
