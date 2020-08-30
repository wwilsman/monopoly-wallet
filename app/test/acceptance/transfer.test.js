import { setupApplication } from '../helpers';

import TransferScreen from '../interactors/transfer';
import DashboardScreen from '../interactors/dashboard';

describe('Transfer Screen', () => {
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
    await TransferScreen().visit();
  });

  it('shows the transfer screen', async () => {
    await TransferScreen()
      .assert.exists();
  });

  it('shows a back button linked to the bank', async () => {
    await TransferScreen()
      .assert.backButton.exists()
      .assert.backButton.attribute('href', '/t35tt/bank');
  });

  it('goes to the bank when clicking the back button', async () => {
    await TransferScreen()
      .backButton.click()
      .assert.location('/t35tt/bank')
      .assert.not.exists();
  });

  it('shows a default withdrawl amount for passing go', async () => {
    await TransferScreen()
      .assert.deposit.not.checked()
      .assert.recipient.label('FROM:\nBANK')
      .assert.recipient.icon('bank')
      .assert.amount(`${config.passGoAmount}`);
  });

  it('shows a default deposit amount for paying to get out a jail', async () => {
    await TransferScreen()
      .deposit.check()
      .assert.deposit.checked()
      .assert.recipient.label('TO:\nBANK')
      .assert.recipient.icon('bank')
      .assert.amount(`${config.payJailAmount}`);
  });

  it('can enter a custom amount', async () => {
    await TransferScreen()
      .input.type('250')
      .assert.deposit.not.checked()
      .assert.amount('250')
      .deposit.check()
      .assert.deposit.checked()
      .assert.amount('250');
  });

  it('restores the default withdrawl on blur when the amount is 0', async () => {
    await TransferScreen()
      .input.type('0', { blur: false })
      .assert.amount('0')
      .input.blur()
      .assert.amount(`${config.passGoAmount}`);
  });

  it('restores the default deposit on blur when the amount is 0', async () => {
    await TransferScreen()
      .deposit.check()
      .input.type('0', { blur: false })
      .assert.deposit.checked()
      .assert.amount('0')
      .input.blur()
      .assert.amount(`${config.payJailAmount}`);
  });

  it('clears the default withdrawl amount after pressing backspace', async () => {
    await TransferScreen()
      .assert.amount(`${config.passGoAmount}`)
      .input.press('Backspace')
      .assert.amount('0');
  });

  it('clears the default deposit amount after pressing backspace', async () => {
    await TransferScreen()
      .deposit.check()
      .assert.amount(`${config.payJailAmount}`)
      .input.press('Backspace')
      .assert.deposit.checked()
      .assert.amount('0');
  });

  it('does not display other players when there are none', async () => {
    await TransferScreen()
      .assert.recipient.label('FROM:\nBANK')
      .assert.recipient.icon('bank')
      .assert.recipient.token().count(0);
  });

  it('has a submit button', async () => {
    await TransferScreen()
      .assert.submitButton.exists();
  });

  it('navigates to the dashboard after withdrawing', async () => {
    await TransferScreen()
      .submitButton.click();
    await DashboardScreen()
      .assert.exists()
      .assert.toast.message('YOU received \n200')
      .assert.summary.balance('1,700');
  });

  it('navigates to the dashboard after depositing', async () => {
    await TransferScreen()
      .deposit.check()
      .submitButton.click();
    await DashboardScreen()
      .assert.exists()
      .assert.toast.message('YOU paid the bank \n50')
      .assert.summary.balance('1,450');
  });

  it('navigates to the dashboard after transfering a custom amount', async () => {
    await TransferScreen()
      .input.type('500')
      .deposit.check()
      .submitButton.click();
    await DashboardScreen()
      .assert.exists()
      .assert.toast.message('YOU paid the bank \n500')
      .assert.summary.balance('1,000');
  });

  describe('with other players', () => {
    beforeEach(async function () {
      await this.grm.mock({
        room: 't35tt',
        players: [
          { token: 'automobile' },
          { token: 'scottish-terrier' },
          { token: 'thimble' }
        ]
      });
    });

    it('selects the bank recipient by default', async () => {
      await TransferScreen()
        .assert.recipient.label('FROM:\nBANK')
        .assert.recipient.icon('bank')
        .assert.recipient.token('bank').selected();
    });

    it('shows other player recipients', async () => {
      await TransferScreen()
        .assert.recipient.token().count(4)
        .assert.recipient.token('bank').exists()
        .assert.recipient.token('automobile').exists()
        .assert.recipient.token('scottish-terrier').exists()
        .assert.recipient.token('thimble').exists();
    });

    it('can only pay players', async () => {
      await TransferScreen()
        .assert.deposit.not.checked()
        .recipient.token('automobile').click()
        .assert.deposit.checked()
        .assert.deposit.disabled();
    });

    it('defaults the amount to 0 for players', async () => {
      await TransferScreen()
        .recipient.token('automobile').click()
        .assert.deposit.checked()
        .assert.deposit.disabled();
    });

    it('navigates to the dashboard after paying a player', async () => {
      await TransferScreen()
        .recipient.token('automobile').click()
        .input.type('100')
        .submitButton.click();
      await DashboardScreen()
        .assert.exists()
        .assert.toast.message('YOU paid PLAYER 2 \n100')
        .assert.summary.balance('1,400')
        .assert.card(1).name('PLAYER 2')
        .assert.card(1).token('automobile')
        .assert.card(1).balance('1,600');
    });

    it('disables bankrupt players', async function() {
      await this.grm.mock({
        room: 't35tt',
        players: [{ token: 'automobile', bankrupt: true }]
      });

      await TransferScreen()
        .assert.recipient.token('automobile').disabled();
    });
  });
});
