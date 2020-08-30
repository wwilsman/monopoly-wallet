import { setupApplication } from '../helpers';

import PropertiesScreen from '../interactors/properties-screen';
import DashboardScreen from '../interactors/dashboard';

describe('Properties Screen', () => {
  setupApplication(async function () {
    await this.grm.mock({
      room: 't35tt',
      players: [
        { token: 'top-hat' },
        { token: 'automobile' },
        { token: 'thimble' }
      ],
      properties: [
        { id: 'mediterranean-avenue', owner: 'top-hat' },
        { group: 'blue', owner: 'top-hat', monopoly: true },
        { id: 'boardwalk', buildings: 1 },
        { id: 'baltic-avenue', owner: 'automobile', mortgaged: true },
        { group: 'green', owner: 'automobile', monopoly: true, buildings: 4 },
        { id: 'pennsylvania-avenue', buildings: 5 },
        { id: 'water-works', owner: 'automobile' }
      ]
    });

    this.ls.data.room = 't35tt',
    this.ls.data.player = { name: 'PLAYER 1', token: 'top-hat' };
    await PropertiesScreen().visit();
  });

  it('shows the room code', async () => {
    await PropertiesScreen()
      .assert.roomCode('T35TT');
  });

  it('shows a property search box', async () => {
    await PropertiesScreen()
      .assert.searchInput.exists();
  });

  it('shows a clear button when focusing the search box', async () => {
    await PropertiesScreen()
      .assert.clearSearch.not.exists()
      .searchInput.focus()
      .assert.clearSearch.exists();
  });

  it('hides the clear button when not focusing with an empty search', async () => {
    await PropertiesScreen()
      .searchInput.focus()
      .assert.clearSearch.exists()
      .searchInput.blur()
      .assert.clearSearch.not.exists();
  });

  it('shows the clear button when not focusing with a search', async () => {
    await PropertiesScreen()
      .searchInput.type('ori')
      .assert.clearSearch.exists()
      .assert.remains();
  });

  it('shows a property after typing part of the property name', async () => {
    await PropertiesScreen()
      .searchInput.type('ven')
      .assert.property.name('VENTNOR AVENUE')
      .assert.property.group('yellow');
  });

  it('shows a property after typing part of the property group', async () => {
    await PropertiesScreen()
      .searchInput.type('magnta')
      .assert.property.name('ST. CHARLES PLACE')
      .assert.property.group('magenta');
  });

  it('shows a property\'s rent information', async () => {
    await PropertiesScreen()
      .searchInput.type('red')
      .assert.property.name('KENTUCKY AVENUE')
      .assert.property.group('red')
      .assert.property.rent(1, 'Rent', '18')
      .assert.property.rent(2, 'Rent with Monopoly', '36')
      .assert.property.rent(3, 'Rent with ', '90')
      .assert.property.rent(4, 'Rent with ', '250')
      .assert.property.rent(5, 'Rent with ', '700')
      .assert.property.rent(6, 'Rent with ', '875');
  });

  it('shows a property\'s mortgage value and build costs', async () => {
    await PropertiesScreen()
      .searchInput.type('marv')
      .assert.property.name('MARVIN GARDENS')
      .assert.property.group('yellow')
      .assert.property.mortgage('140')
      .assert.property.cost('150');
  });

  it('shows a not-found message when there is no matching property', async () => {
    await PropertiesScreen()
      .searchInput.type('old kent rd')
      .assert.property.not.exists()
      .assert.notFound.exists()
      .assert.notFound.text('NO MATCHING\nPROPERTIES');
  });

  describe('bank properties', () => {
    it('shows the bank properties screen', async () => {
      await PropertiesScreen()
        .assert.exists();
    });

    it('shows a back button linked to the bank', async () => {
      await PropertiesScreen()
        .assert.backButton.exists()
        .assert.backButton.attribute('href', '/t35tt/bank');
    });

    it('goes to the bank when clicking the back button', async () => {
      await PropertiesScreen()
        .backButton.click()
        .assert.location('/t35tt/bank')
        .assert.not.exists();
    });

    it('shows a buy button', async () => {
      await PropertiesScreen()
        .searchInput.type('read')
        .assert.property.name('READING RAILROAD')
        .assert.property.buyButton.exists()
        .assert.property.buyButton.text(/Buy for ..200/s);
    });

    it('shows an "enter other amount" button', async () => {
      await PropertiesScreen()
        .searchInput.type('ill')
        .assert.property.name('ILLINOIS AVENUE')
        .assert.property.otherButton.exists()
        .assert.property.otherButton.text('enter other amount')
        .assert.property.otherButton.attribute('href', '/t35tt/illinois-avenue/buy');
    });

    it('navigates to the dashboard after buying a property', async () => {
      await PropertiesScreen()
        .searchInput.type('ill')
        .assert.property.name('ILLINOIS AVENUE')
        .assert.property.buyButton.text(/Buy for ..240/s)
        .property.buyButton.click();
      await DashboardScreen()
        .assert.exists()
        .assert.toast.message('YOU purchased Illinois Avenue')
        .assert.summary.balance('1,260');
    });
  });

  describe('own properties', () => {
    beforeEach(async () => {
      await PropertiesScreen().visit('/t35tt/top-hat/properties');
    });

    it('shows your own properties screen', async () => {
      await PropertiesScreen()
        .assert.exists();
    });

    it('shows a back button linked to the dashboard', async () => {
      await PropertiesScreen()
        .assert.backButton.exists()
        .assert.backButton.attribute('href', '/t35tt');
    });

    it('goes to the dashboard when clicking the back button', async () => {
      await PropertiesScreen()
        .backButton.click()
        .assert.location('/t35tt')
        .assert.not.exists();
    });

    it('shows a mortgage button that mortgages a property', async () => {
      await PropertiesScreen()
        .searchInput.type('med')
        .assert.property.name('MEDITERRANEAN AVENUE')
        .assert.property.not.mortgaged()
        .assert.property.mortgageButton.exists()
        .assert.property.mortgageButton.text('Mortgage')
        .property.mortgageButton.click()
        .assert.property.mortgaged();
    });

    it('does not show an improve or unimprove button', async () => {
      await PropertiesScreen()
        .searchInput.type('med')
        .assert.property.name('MEDITERRANEAN AVENUE')
        .assert.property.improveButton.not.exists()
        .assert.property.unimproveButton.not.exists();
    });

    it('shows an improve button that unimproves a property of a monopoly', async () => {
      await PropertiesScreen()
        .searchInput.type('blue')
        .assert.property.name('PARK PLACE')
        .assert.property.not.improved()
        .assert.property.improveButton.exists()
        .assert.property.improveButton.text('Improve')
        .property.improveButton.click()
        .assert.property.improved();
    });

    it('does not show an improve button when fully improved or mortgaged', async function() {
      await this.grm.mock({
        room: 't35tt',
        properties: [
          { id: 'baltic-avenue', owner: 'top-hat' },
          { group: 'blue', buildings: 5 }
        ]
      });

      await PropertiesScreen()
        .searchInput.type('blue')
        .assert.property.name('PARK PLACE')
        .assert.property.hotels(1)
        .assert.property.improveButton.not.exists();
      await PropertiesScreen()
        .clearSearch.click()
        .searchInput.type('balt')
        .assert.property.name('BALTIC AVENUE')
        .assert.property.mortgaged()
        .assert.property.improveButton.not.exists();
    });

    it('shows an unimprove button that unimproves an improved property', async () => {
      await PropertiesScreen()
        .searchInput.type('board')
        .assert.property.name('BOARDWALK')
        .assert.property.improved()
        .assert.property.unimproveButton.exists()
        .assert.property.unimproveButton.text('Unimprove')
        .property.unimproveButton.click()
        .assert.property.not.improved();
    });

    it('does not show a mortgage button with improvements', async () => {
      await PropertiesScreen()
        .searchInput.type('board')
        .assert.property.name('BOARDWALK')
        .assert.property.improved()
        .assert.property.mortgageButton.not.exists();
    });

    it('shows an unmortgage button that unmortgages a mortgaged property', async function() {
      await this.grm.mock({
        room: 't35tt',
        properties: [
          { id: 'mediterranean-avenue', mortgaged: true }
        ]
      });

      await PropertiesScreen()
        .searchInput.type('med')
        .assert.property.name('MEDITERRANEAN AVENUE')
        .assert.property.mortgaged()
        .assert.property.unmortgageButton.exists()
        .assert.property.unmortgageButton.text(/Unmortgage ..33/s)
        .property.unmortgageButton.click()
        .assert.property.not.mortgaged();
    });

    it('shows a transfer button when not mortgaged nor a monopoly', async () => {
      await PropertiesScreen()
        .searchInput.type('med')
        .assert.property.name('MEDITERRANEAN AVENUE')
        .assert.property.not.mortgaged()
        .assert.property.improveButton.not.exists()
        .assert.property.transferButton.exists()
        .assert.property.transferButton.attribute('href', '/t35tt/mediterranean-avenue/transfer');
    });
  });

  describe('other player properties', () => {
    beforeEach(async () => {
      await PropertiesScreen().visit('/t35tt/automobile/properties');
    });

    it('shows the player properties screen', async () => {
      await PropertiesScreen()
        .assert.exists();
    });

    it('shows a back button linked to the dashboard', async () => {
      await PropertiesScreen()
        .assert.backButton.exists()
        .assert.backButton.attribute('href', '/t35tt');
    });

    it('goes to the dashboard when clicking the back button', async () => {
      await PropertiesScreen()
        .backButton.click()
        .assert.location('/t35tt')
        .assert.not.exists();
    });

    it('shows a message when there are no properties', async () => {
      await PropertiesScreen()
        .visit('/t35tt/thimble/properties')
        .assert.searchInput.not.exists()
        .assert.property.not.exists()
        .assert.empty.exists()
        .assert.empty.text('NO OWNED PROPERTIES');
    });

    it('shows when a property has houses', async () => {
      await PropertiesScreen()
        .searchInput.type('paf')
        .assert.property.name('PACIFIC AVENUE')
        .assert.property.houses(4);
    });

    it('shows when a property has a hotel', async () => {
      await PropertiesScreen()
        .searchInput.type('pev')
        .assert.property.name('PENNSYLVANIA AVENUE')
        .assert.property.houses(0)
        .assert.property.hotels(1);
    });

    it('shows when a property is mortgaged', async () => {
      await PropertiesScreen()
        .searchInput.type('bal')
        .assert.property.name('BALTIC AVENUE')
        .assert.property.mortgaged();
    });

    it('shows a rent button', async () => {
      await PropertiesScreen()
        .searchInput.type('penn')
        .assert.property.name('PENNSYLVANIA AVENUE')
        .assert.property.rentButton.exists()
        .assert.property.rentButton.text(/Pay Rent .\(.1,400.\)/s);
    });

    it('does not show a rent button when mortgaged', async () => {
      await PropertiesScreen()
        .searchInput.type('bal')
        .assert.property.name('BALTIC AVENUE')
        .assert.property.rentButton.not.exists();
    });

    it('navigates to the dashboard after renting a property', async () => {
      await PropertiesScreen()
        .searchInput.type('pac')
        .assert.property.name('PACIFIC AVENUE')
        .assert.property.rentButton.text(/Pay Rent .\(.1,100.\)/s)
        .property.rentButton.click();
      await DashboardScreen()
        .assert.exists()
        .assert.toast.message('YOU paid PLAYER 2 rent for Pacific Avenue')
        .assert.summary.balance('400');
    });

    it('does not show a rent button when bankrupt', async function() {
      await this.grm.mock({
        room: 't35tt',
        players: [{ token: 'top-hat', bankrupt: true }]
      });

      await PropertiesScreen()
        .searchInput.type('penn')
        .assert.property.name('PENNSYLVANIA AVENUE')
        .assert.property.rentButton.not.exists();
    });

    describe('renting utilities', () => {
      beforeEach(async () => {
        await PropertiesScreen()
          .searchInput.type('wat')
          .assert.property.name('WATER WORKS')
          .assert.property.rentButton.text(/Pay Rent .\(x4\)/s)
          .property.rentButton.click();
      });

      it('shows a utility rent form', async () => {
        await PropertiesScreen()
          .assert.utilityForm.exists()
          .assert.utilityForm.value('2');
      });

      it('can enter a custom dice roll', async () => {
        await PropertiesScreen()
          .assert.utilityForm.value('2')
          .utilityForm.input.press('Backspace')
          .assert.utilityForm.value('')
          .utilityForm.input.type('10')
          .assert.utilityForm.value('10');
      });

      it('can click for a random dice roll', async () => {
        await PropertiesScreen()
          .assert.utilityForm.value('2')
          .utilityForm.rollButton.click()
          .assert.utilityForm.not.value('2');
      // sometimes it rolls a 2, what are the chances it'll happen twice?
      }).retries(2);

      it('disables the submit button when the roll is outside of the range', async () => {
        await PropertiesScreen()
          .assert.utilityForm.value('2')
          .assert.utilityForm.submitButton.not.disabled()
          .utilityForm.input.press(['Backspace', '1', '5'])
          .assert.utilityForm.value('15')
          .assert.utilityForm.submitButton.disabled();
      });

      it('clamps the roll amount after blurring when outside of the range', async () => {
        await PropertiesScreen()
          .utilityForm.input.focus()
          .utilityForm.input.press(['Backspace', '0'])
          .assert.utilityForm.value('0')
          .assert.utilityForm.submitButton.disabled()
          .utilityForm.input.blur()
          .assert.utilityForm.value('2')
          .assert.utilityForm.submitButton.not.disabled();

        await PropertiesScreen()
          .utilityForm.input.focus()
          .utilityForm.input.press(['Backspace', '2', '0'])
          .assert.utilityForm.value('20')
          .assert.utilityForm.submitButton.disabled()
          .utilityForm.input.blur()
          .assert.utilityForm.value('12')
          .assert.utilityForm.submitButton.not.disabled();
      });

      it('navigates to the dashboard after renting', async () => {
        await PropertiesScreen()
          .utilityForm.submitButton.click();
        await DashboardScreen()
          .assert.exists()
          .assert.toast.message('YOU paid PLAYER 2 rent for Water Works')
          .assert.summary.balance('1,492');
      });
    });
  });
});
