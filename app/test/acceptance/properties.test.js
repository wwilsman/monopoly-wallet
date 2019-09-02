import { setupApplication } from '../helpers';

import PropertySearchInteractor from '../interactors/property-search';
import DashboardInteractor from '../interactors/dashboard';

describe.skip('PropertiesScreen', () => {
  const search = new PropertySearchInteractor();
  const dashboard = new DashboardInteractor();

  setupApplication(async function () {
    await this.grm.mock({
      room: 't35tt',
      players: [
        { token: 'top-hat' },
        { token: 'automobile' },
        { token: 'thimble' }
      ],
      properties: [
        { id: 'baltic-avenue', owner: 'automobile', mortgaged: true },
        { group: 'green', owner: 'automobile', monopoly: true, buildings: 4 },
        { id: 'pennsylvania-avenue', buildings: 5 }
      ]
    });

    this.ls.data.room = 't35tt',
    this.ls.data.player = { name: 'PLAYER 1', token: 'top-hat' };
    await search.visit();
  });

  it('shows the room code', async () => {
    await search
      .assert.roomCode('T35TT');
  });

  it('shows a property search box', async () => {
    await search
      .assert.input.exists();
  });

  it('shows a clear button when focusing the search box', async () => {
    await search
      .assert.clearBtn.not.exists()
      .input.focus()
      .assert.clearBtn.exists();
  });

  it('hides the clear button when not focusing with an empty search', async () => {
    await search
      .input.focus()
      .assert.clearBtn.exists()
      .input.blur()
      .assert.clearBtn.not.exists();
  });

  it('shows the clear button when not focusing with a search', async () => {
    await search
      .input.focus()
      .input.type('ori')
      .input.blur()
      .assert.clearBtn.exists()
      .assert.remains();
  });

  it('shows a property after typing part of the property name', async () => {
    await search
      .input.type('vnto')
      .assert.property.name('VENTNOR AVENUE')
      .assert.property.group('yellow');
  });

  it('shows a property after typing part of the property group', async () => {
    await search
      .input.type('magnta')
      .assert.property.name('ST. CHARLES PLACE')
      .assert.property.group('magenta');
  });

  it('shows a property\'s rent information', async () => {
    await search
      .input.type('red')
      .assert.property.name('KENTUCKY AVENUE')
      .assert.property.group('red')
      .assert.property.rentLabels(0).text('Rent')
      .assert.property.rentAmounts(0).text('18')
      .assert.property.rentLabels(1).text('Rent with Monopoly')
      .assert.property.rentAmounts(1).text('36')
      .assert.property.rentLabels(2).text('Rent with ')
      .assert.property.rentAmounts(2).text('90')
      .assert.property.rentLabels(3).text('Rent with ')
      .assert.property.rentAmounts(3).text('250')
      .assert.property.rentLabels(4).text('Rent with ')
      .assert.property.rentAmounts(4).text('700')
      .assert.property.rentLabels(5).text('Rent with ')
      .assert.property.rentAmounts(5).text('875');
  });

  it('shows a property\'s mortgage value, and build costs', async () => {
    await search
      .input.type('park')
      .assert.property.name('PARK PLACE')
      .assert.property.group('blue')
      .assert.property.mortgage('100')
      .assert.property.cost('100');
  });

  it('shows a not-found message when there is no matching property', async () => {
    await search
      .input.type('old kent rd')
      .assert.property.not.exists()
      .assert.notFound.exists()
      .assert.notFound.text('NO MATCHING\nPROPERTIES')
      .percySnapshot('not found');
  });

  describe('bank properties', () => {
    it('shows the bank properties screen', async () => {
      await search
        .assert.exists()
        .assert.heading.text('PROPERTIES')
        .assert.heading.icon('bank')
        .percySnapshot();
    });

    it('shows a back button linked to the bank', async () => {
      await search
        .assert.backBtn.exists()
        .assert.backBtn.attribute('href', '/t35tt/bank');
    });

    it('goes to the bank when clicking the back button', async () => {
      await search
        .backBtn.click()
        .assert.location('/t35tt/bank')
        .assert.not.exists();
    });

    it('shows a buy button', async () => {
      await search
        .input.type('board')
        .assert.property.name('BOARDWALK')
        .assert.property.buyBtn.exists()
        .assert.property.buyBtn.text('Buy for\n400')
        .percySnapshot('with a buy button');
    });

    it('navigates to the dashboard after buying a property', async () => {
      await search
        .input.type('ill')
        .assert.property.name('ILLINOIS AVENUE')
        .assert.property.buyBtn.text('Buy for\n240')
        .property.buyBtn.click();
      await dashboard
        .assert.exists()
        .assert.toast.message('YOU purchased Illinois Avenue')
        .assert.summary.balance('1,260');
      await search
        .percySnapshot('after buying');
    });
  });

  describe('other player properties', async () => {
    beforeEach(async () => {
      await search.visit('/t35tt/automobile/properties');
    });

    it('shows the player properties screen', async () => {
      await search
        .assert.exists()
        .assert.heading.text('PLAYER 2')
        .assert.heading.icon('automobile')
        .percySnapshot('other player');
    });

    it('shows a back button linked to the dashboard', async () => {
      await search
        .assert.backBtn.exists()
        .assert.backBtn.attribute('href', '/t35tt');
    });

    it('goes to the dashboard when clicking the back button', async () => {
      await search
        .backBtn.click()
        .assert.location('/t35tt')
        .assert.not.exists();
    });

    it('shows a message when there are no properties', async () => {
      await search
        .visit('/t35tt/thimble/properties')
        .assert.input.not.exists()
        .assert.property.not.exists()
        .assert.empty.exists()
        .assert.empty.text('NO OWNED PROPERTIES')
        .percySnapshot('empty');
    });

    it('shows when a property has houses', async () => {
      await search
        .input.type('paf')
        .assert.property.name('PACIFIC AVENUE')
        .assert.property.houses(4)
        .percySnapshot('with houses');
    });

    it('shows when a property has a hotel', async () => {
      await search
        .input.type('pev')
        .assert.property.name('PENNSYLVANIA AVENUE')
        .assert.property.houses(0)
        .assert.property.hotels(1)
        .percySnapshot('with hotel');
    });

    it('shows when a property is mortgaged', async () => {
      await search
        .input.type('bal')
        .assert.property.name('BALTIC AVENUE')
        .assert.property.mortgaged()
        .percySnapshot('mortgaged');
    });

    it('shows a rent button', async () => {
      await search
        .input.type('penn')
        .assert.property.name('PENNSYLVANIA AVENUE')
        .assert.property.rentBtn.exists()
        .assert.property.rentBtn.text('Pay Rent —\n1,400')
        .percySnapshot('with a rent button');
    });

    it('does not show a rent button when mortgaged', async () => {
      await search
        .input.type('bal')
        .assert.property.name('BALTIC AVENUE')
        .assert.property.rentBtn.not.exists();
    });

    it('navigates to the dashboard after renting a property', async () => {
      await search
        .input.type('pac')
        .assert.property.name('PACIFIC AVENUE')
        .assert.property.rentBtn.text('Pay Rent —\n1,100')
        .property.rentBtn.click();
      await dashboard
        .assert.exists()
        .assert.toast.message('YOU paid PLAYER 2 rent for Pacific Avenue')
        .assert.summary.balance('400');
      await search
        .percySnapshot('after renting');
    });
  });
});
