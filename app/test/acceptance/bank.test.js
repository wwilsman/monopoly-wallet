import { setupApplication, mockGame } from '../helpers';

import BankInteractor from '../interactors/bank';

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
});
