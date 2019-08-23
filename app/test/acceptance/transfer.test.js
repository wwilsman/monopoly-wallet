import { setupApplication } from '../helpers';

import TransferInteractor from '../interactors/transfer';
import DashboardInteractor from '../interactors/dashboard';

describe('TransferScreen', () => {
  const transfer = new TransferInteractor();
  const dashboard = new DashboardInteractor();
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
    await transfer.visit();
  });

  it('shows the transfer screen', async () => {
    await transfer
      .assert.exists()
      .percySnapshot();
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

  it('shows a back button linked to the bank', async () => {
    await transfer
      .assert.backBtn.exists()
      .assert.backBtn.attribute('href', '/t35tt/bank');
  });

  it('goes to the bank when clicking the back button', async () => {
    await transfer
      .backBtn.click()
      .assert.location('/t35tt/bank')
      .assert.not.exists();
  });

  it('shows a default withdrawl amount for passing go', async () => {
    await transfer
      .assert.deposit.not.checked()
      .assert.recipient.label('FROM:\nBANK')
      .assert.recipient.icon('bank')
      .assert.amount(`${config.passGoAmount}`);
  });

  it('shows a default deposit amount for paying to get out a jail', async () => {
    await transfer
      .deposit.check()
      .assert.deposit.checked()
      .assert.recipient.label('TO:\nBANK')
      .assert.recipient.icon('bank')
      .assert.amount(`${config.payJailAmount}`)
      .percySnapshot('deposit');
  });

  it('can enter a custom amount', async () => {
    await transfer
      .input.type('250')
      .assert.deposit.not.checked()
      .assert.amount('250')
      .deposit.check()
      .assert.deposit.checked()
      .assert.amount('250')
      .percySnapshot('custom');
  });

  it('restores the default withdrawl on blur when the amount is 0', async () => {
    await transfer
      .input.focus()
      .input.type('0')
      .assert.amount('0')
      .input.blur()
      .assert.amount(`${config.passGoAmount}`);
  });

  it('restores the default deposit on blur when the amount is 0', async () => {
    await transfer
      .deposit.check()
      .input.focus()
      .input.type('0')
      .assert.deposit.checked()
      .assert.amount('0')
      .input.blur()
      .assert.amount(`${config.payJailAmount}`);
  });

  it('clears the default withdrawl amount after pressing backspace', async () => {
    await transfer
      .assert.amount(`${config.passGoAmount}`)
      .input.press('Backspace')
      .assert.amount('0');
  });

  it('clears the default deposit amount after pressing backspace', async () => {
    await transfer
      .deposit.check()
      .assert.amount(`${config.payJailAmount}`)
      .input.press('Backspace')
      .assert.deposit.checked()
      .assert.amount('0');
  });

  it('does not display other players when there are none', async () => {
    await transfer
      .assert.recipient.label('FROM:\nBANK')
      .assert.recipient.icon('bank')
      .assert.recipient.count(0);
  });

  it('has a submit button', async () => {
    await transfer
      .assert.submit.exists();
  });

  it('navigates to the dashboard after withdrawing', async () => {
    await transfer
      .submit.click();
    await dashboard
      .assert.exists()
      .assert.toast.message('YOU received \n200')
      .assert.summary.balance('1,700');
    await transfer
      .percySnapshot('after withdrawl');
  });

  it('navigates to the dashboard after depositing', async () => {
    await transfer
      .deposit.check()
      .submit.click();
    await dashboard
      .assert.exists()
      .assert.toast.message('YOU paid the bank \n50')
      .assert.summary.balance('1,450');
    await transfer
      .percySnapshot('after deposit');
  });

  it('navigates to the dashboard after transfering a custom amount', async () => {
    await transfer
      .input.type('500')
      .deposit.check()
      .submit.click();
    await dashboard
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
          { token: 'scottish-terrior' },
          { token: 'thimble' }
        ]
      });
    });

    it('selects the bank recipient by default', async () => {
      await transfer
        .assert.recipient.label('FROM:\nBANK')
        .assert.recipient.icon('bank')
        .assert.recipient.token('bank').selected()
        .percySnapshot('with other players (bank)');
    });

    it('shows other player recipients', async () => {
      await transfer
        .assert.recipient.count(4)
        .assert.recipient.token('bank').exists()
        .assert.recipient.token('automobile').exists()
        .assert.recipient.token('scottish-terrior').exists()
        .assert.recipient.token('thimble').exists();
    });

    it('can only pay players', async () => {
      await transfer
        .assert.deposit.not.checked()
        .recipient.token('automobile').click()
        .assert.deposit.checked()
        .assert.deposit.disabled()
        .percySnapshot('with other players (automobile)');
    });

    it('defaults the amount to 0 for players', async () => {
      await transfer
        .recipient.token('automobile').click()
        .assert.deposit.checked()
        .assert.deposit.disabled();
    });

    it('navigates to the dashboard after paying a player', async () => {
      await transfer
        .recipient.token('automobile').click()
        .input.type('100')
        .submit.click();
      await dashboard
        .assert.exists()
        .assert.toast.message('YOU paid PLAYER 2 \n100')
        .assert.summary.balance('1,400')
        .assert.card(0).name('PLAYER 2')
        .assert.card(0).token('automobile')
        .assert.card(0).balance('1,600');
      await transfer
        .percySnapshot('after paying a player');
    });
  });
});
