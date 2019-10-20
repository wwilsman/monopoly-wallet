import { setupApplication } from '../helpers';

import BankInteractor from '../interactors/bank';

describe('BankScreen', () => {
  const bank = new BankInteractor();

  setupApplication(async function () {
    await this.grm.mock({
      room: 't35tt',
      players: [
        { token: 'top-hat' }
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

  it('does not render history without data', async () => {
    await bank.assert.gameHistory.not.exists();
  });
});

describe('Bank with game history', () => {
  const bank = new BankInteractor();

  setupApplication(async function () {
    await this.grm.mock({
      room: 't35tt',
      players: [
        { token: 'top-hat' }
      ],
      notice: { message: 'PLAYER 1 purchased Vermont Avenue', token: 'top-hat' },
      history: [
        { notice: { message: 'PLAYER 1 joined the game', token: 'top-hat' } },
        { notice: { message: 'PLAYER 1 received 200', token: 'top-hat' } }
      ]
    });

    this.ls.data.room = 't35tt';
    this.ls.data.player = { name: 'PLAYER 1', token: 'top-hat' };

    await bank.visit();
  });

  it('shows the game history', async () => {
    await bank
      .assert.exists()
      .assert.gameHistory.toasts(0).message('PLAYER 1 purchased Vermont Avenue')
      .assert.gameHistory.toasts().count(3)
      .percySnapshot('with history');
  });
});
