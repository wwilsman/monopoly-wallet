import { setupApplication } from '../helpers';
import TransferPropertyScreen from '../interactors/transfer-property';
import DashboardScreen from '../interactors/dashboard';

describe('BuyPropertyScreen', () => {
  setupApplication(async () => {
    await TransferPropertyScreen()
      .mock({
        room: 't35tt',
        players: [{ token: 'top-hat' }],
        localstorage: {
          room: 't35tt',
          player: { name: 'PLAYER 1', token: 'top-hat' }
        }
      })
      .visit('/t35tt/oriental-avenue/buy');
  });

  it('shows the buy property screen', async () => {
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

  it('shows a default amount for the property\'s price', async () => {
    await TransferPropertyScreen()
      .assert.amount('100');
  });

  it('shows the property card', async () => {
    await TransferPropertyScreen()
      .assert.property('ORIENTAL AVENUE');
  });

  it('can enter a custom amount', async () => {
    await TransferPropertyScreen()
      .input.type('30')
      .assert.amount('30');
  });

  it('restores the defaults amount on blur when the amount is 0', async () => {
    await TransferPropertyScreen()
      .input.type('0', { blur: false })
      .assert.amount('0')
      .input.blur()
      .assert.amount('100');
  });

  it('clears the default amount after pressing backspace', async () => {
    await TransferPropertyScreen()
      .assert.amount('100')
      .input.press('Backspace')
      .assert.amount('0');
  });

  it('has a submit button', async () => {
    await TransferPropertyScreen()
      .assert.submitButton.exists();
  });

  it('navigates to the dashboard after purchasing', async () => {
    await TransferPropertyScreen()
      .input.type('20')
      .submitButton.click();
    await DashboardScreen()
      .assert.exists()
      .assert.toast.message('YOU purchased Oriental Avenue')
      .assert.summary.balance('1,480');
  });
});
