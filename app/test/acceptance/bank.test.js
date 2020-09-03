import { setupApplication } from '../helpers';
import BankScreen from '../interactors/bank';
import DashboardScreen from '../interactors/dashboard';

describe('BankScreen', () => {
  setupApplication(async () => {
    await BankScreen()
      .mock({
        room: 't35tt',
        players: [
          { token: 'top-hat' },
          { token: 'automobile' }
        ],
        properties: [
          { group: 'orange', owner: 'top-hat' }
        ],
        localstorage: {
          room: 't35tt',
          player: { name: 'PLAYER 1', token: 'top-hat' }
        }
      })
      .visit();
  });

  it('shows the bank screen', async () => {
    await BankScreen()
      .assert.exists();
  });

  it('shows the room code', async () => {
    await BankScreen()
      .assert.roomCode('T35TT');
  });

  it('shows a back button linked to the dashboard', async () => {
    await BankScreen()
      .assert.backButton.exists()
      .assert.backButton.attribute('href', '/t35tt');
  });

  it('goes to the dashboard when clicking the back button', async () => {
    await BankScreen()
      .backButton.click()
      .assert.location('/t35tt')
      .assert.not.exists();
  });

  it('shows a link to the transfer screen', async () => {
    await BankScreen()
      .assert.link(1).text('MAKE A TRANSFER')
      .assert.link(1).icon('transfer')
      .assert.link(1).attribute('href', '/t35tt/transfer');
  });

  it('shows a link to the properties screen', async () => {
    await BankScreen()
      .assert.link(2).text('PURCHASE PROPERTIES')
      .assert.link(2).icon('bank')
      .assert.link(2).attribute('href', '/t35tt/properties');
  });

  it('shows a button for claiming bankruptcy', async () => {
    await BankScreen()
      .assert.link(3).text('CLAIM BANKRUPTCY')
      .assert.link(3).icon('currency')
      .assert.link(3).not.attribute('href');
  });

  it('shows game history', async () => {
    await BankScreen()
      .mock({
        room: 't35tt',
        notice: { message: 'PLAYER 1 purchased Vermont Avenue', token: 'top-hat' },
        history: [
          { notice: { message: 'PLAYER 2 joined the game', token: 'top-hat' } },
          { notice: { message: 'PLAYER 1 received 200', token: 'top-hat' } }
        ]
      })
      .assert.gameHistory.item(1).message('YOU purchased Vermont Avenue')
      .assert.gameHistory.item().count(3);
  });

  it('does not show game history when there is none', async () => {
    await BankScreen()
      .assert.gameHistory.not.exists();
  });

  it('shows a bankruptcy modal after clicking the bankrupt button', async () => {
    await BankScreen()
      .link(3).click()
      .assert.bankrupt.exists()
      .assert.bankrupt.players.item().count(2)
      .assert.bankrupt.players.item('bank').exists()
      .assert.bankrupt.players.item('automobile').exists()
      .assert.bankrupt.submitButton.exists();
  });

  it('goes to the dashboard after claiming bankruptcy', async () => {
    await BankScreen()
      .link(3).click()
      .bankrupt.submitButton.click();
    await DashboardScreen()
      .assert.exists()
      .assert.toast.message('YOU went bankrupt');
  });

  it('can choose another player as the bankrupt beneficiary', async () => {
    await BankScreen()
      .link(3).click()
      .bankrupt.players.item('automobile').click()
      .bankrupt.submitButton.click();
    await DashboardScreen()
      .assert.exists()
      .assert.toast.message('PLAYER 2 bankrupt YOU');
  });

  it('does not show actions for bankrupt players', async () => {
    await BankScreen()
      .mock({ room: 't35tt', players: [{ token: 'top-hat', bankrupt: true }] })
      .assert.link().count(0);
  });

  it('disables bankrupt players when choosing a bankrupt beneficiary', async () => {
    await BankScreen()
      .mock({ room: 't35tt', players: [{ token: 'automobile', bankrupt: true }] })
      .link(3).click()
      .assert.bankrupt.players.item('automobile').disabled();
  });
});
