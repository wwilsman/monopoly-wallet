import { setupApplication } from '../helpers';
import TransferPropertyScreen from '../interactors/transfer-property';
import DashboardScreen from '../interactors/dashboard';

describe('Transfer Property Screen', () => {
  setupApplication(async () => {
    await TransferPropertyScreen()
      .mock({
        room: 't35tt',
        players: [
          { token: 'top-hat' },
          { token: 'automobile' },
          { token: 'thimble' }
        ],
        properties: [
          { id: 'baltic-avenue', owner: 'top-hat' }
        ],
        localstorage: {
          room: 't35tt',
          player: { name: 'PLAYER 1', token: 'top-hat' }
        }
      })
      .visit('/t35tt/baltic-avenue/transfer');
  });

  it('shows the transfter property screen', async () => {
    await TransferPropertyScreen()
      .assert.exists();
  });

  it('shows a back button linked to the properties screen', async () => {
    await TransferPropertyScreen()
      .assert.backButton.exists()
      .assert.backButton.attribute('href', '/t35tt/properties');
  });

  it('goes to the properties screen when clicking the back button', async () => {
    await TransferPropertyScreen()
      .backButton.click()
      .assert.location('/t35tt/properties')
      .assert.not.exists();
  });

  it('has the first other player selected by default', async () => {
    await TransferPropertyScreen()
      .assert.recipient('automobile').selected();
  });

  it('shows the property card', async () => {
    await TransferPropertyScreen()
      .assert.property('BALTIC AVENUE');
  });

  it('can choose another player', async () => {
    await TransferPropertyScreen()
      .recipient('thimble').select()
      .assert.recipient('thimble').selected();
  });

  it('disables bankrupt players', async () => {
    await TransferPropertyScreen()
      .mock({ room: 't35tt', players: [{ token: 'thimble', bankrupt: true }] })
      .assert.recipient('thimble').disabled();
  });

  it('has a submit button', async () => {
    await TransferPropertyScreen()
      .assert.submitButton.exists();
  });

  it('navigates to the dashboard after transferring', async () => {
    await TransferPropertyScreen()
      .submitButton.click();
    await DashboardScreen()
      .assert.exists()
      .assert.toast.message('PLAYER 2 received Baltic Avenue')
      .assert.summary.property('baltic-avenue').not.exists()
      .assert.card(1).property('baltic-avenue').exists();
  });
});
