import { setupApplication } from '../helpers';

import PropertySearchInteractor from '../interactors/property-search';
import DashboardInteractor from '../interactors/dashboard';

describe('PropertiesScreen', () => {
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
        .input.type('read')
        .assert.property.name('READING RAILROAD')
        .assert.property.buyBtn.exists()
        .assert.property.buyBtn.text(/Buy for ..200/s)
        .percySnapshot('with a buy button');
    });

    it('shows an "enter other amount" button', async () => {
      await search
        .input.type('ill')
        .assert.property.name('ILLINOIS AVENUE')
        .assert.property.otherBtn.exists()
        .assert.property.otherBtn.text('enter other amount')
        .assert.property.otherBtn.attribute('href', '/t35tt/illinois-avenue/buy');
    });

    it('navigates to the dashboard after buying a property', async () => {
      await search
        .input.type('ill')
        .assert.property.name('ILLINOIS AVENUE')
        .assert.property.buyBtn.text(/Buy for ..240/s)
        .property.buyBtn.click();
      await dashboard
        .assert.exists()
        .assert.toast.message('YOU purchased Illinois Avenue')
        .assert.summary.balance('1,260');
      await search
        .percySnapshot('after buying');
    });
  });

  describe('own properties', () => {
    beforeEach(async () => {
      await search.visit('/t35tt/top-hat/properties');
    });

    it('shows your own properties screen', async () => {
      await search
        .assert.exists()
        .assert.heading.text('PLAYER 1')
        .assert.heading.icon('top-hat')
        .percySnapshot('own');
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

    it('shows a mortgage button that mortgages a property', async () => {
      await search
        .input.type('med')
        .assert.property.name('MEDITERRANEAN AVENUE')
        .assert.property.not.mortgaged()
        .assert.property.mortgageBtn.exists()
        .assert.property.mortgageBtn.text('Mortgage')
        .percySnapshot('own with a mortgage button')
        .property.mortgageBtn.click()
        .assert.property.mortgaged()
        .percySnapshot('own after mortgaging');
    });

    it('does not show an improve or unimprove button', async () => {
      await search
        .input.type('med')
        .assert.property.name('MEDITERRANEAN AVENUE')
        .assert.property.improveBtn.not.exists()
        .assert.property.unimproveBtn.not.exists();
    });

    it('shows an improve button that unimproves a property of a monopoly', async () => {
      await search
        .input.type('blue')
        .assert.property.name('PARK PLACE')
        .assert.property.not.improved()
        .assert.property.improveBtn.exists()
        .assert.property.improveBtn.text('Improve')
        .percySnapshot('own with an improve button')
        .property.improveBtn.click()
        .assert.property.improved()
        .percySnapshot('own after improving');
    });

    it('does not show an improve button when fully improved or mortgaged', async function() {
      await this.grm.mock({
        room: 't35tt',
        properties: [
          { id: 'baltic-avenue', owner: 'top-hat' },
          { group: 'blue', buildings: 5 }
        ]
      });

      await search
        .input.type('blue')
        .assert.property.name('PARK PLACE')
        .assert.property.hotels(1)
        .assert.property.improveBtn.not.exists()
        .percySnapshot('own fully improved');

      await search
        .input.type('bal', { range: [0, -1] })
        .assert.property.name('BALTIC AVENUE')
        .assert.property.mortgaged()
        .assert.property.improveBtn.not.exists()
        .percySnapshot('own mortgaged');
    });

    it('shows an unimprove button that unimproves an improved property', async () => {
      await search
        .input.type('board')
        .assert.property.name('BOARDWALK')
        .assert.property.improved()
        .assert.property.unimproveBtn.exists()
        .assert.property.unimproveBtn.text('Unimprove')
        .percySnapshot('own with an unimprove button')
        .property.unimproveBtn.click()
        .assert.property.not.improved()
        .percySnapshot('own after unimproving');
    });

    it('does not show a mortgage button with improvements', async () => {
      await search
        .input.type('board')
        .assert.property.name('BOARDWALK')
        .assert.property.improved()
        .assert.property.mortgageBtn.not.exists();
    });

    it('shows an unmortgage button that unmortgages a mortgaged property', async function() {
      await this.grm.mock({
        room: 't35tt',
        properties: [
          { id: 'mediterranean-avenue', mortgaged: true }
        ]
      });

      await search
        .input.type('med')
        .assert.property.name('MEDITERRANEAN AVENUE')
        .assert.property.mortgaged()
        .assert.property.unmortgageBtn.exists()
        .assert.property.unmortgageBtn.text(/Unmortgage ..33/s)
        .percySnapshot('own with an unmortgage button')
        .property.unmortgageBtn.click()
        .assert.property.not.mortgaged()
        .percySnapshot('own after unmortgaging');
    });

    it('shows a transfer button when not mortgaged nor a monopoly', async () => {
      await search
        .input.type('med')
        .assert.property.name('MEDITERRANEAN AVENUE')
        .assert.property.not.mortgaged()
        .assert.property.improveBtn.not.exists()
        .assert.property.transferBtn.exists()
        .assert.property.transferBtn.attribute('href', '/t35tt/mediterranean-avenue/transfer');
    });
  });

  describe('other player properties', () => {
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
        .assert.property.rentBtn.text(/Pay Rent .\(.1,400.\)/s)
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
        .assert.property.rentBtn.text(/Pay Rent .\(.1,100.\)/s)
        .property.rentBtn.click();
      await dashboard
        .assert.exists()
        .assert.toast.message('YOU paid PLAYER 2 rent for Pacific Avenue')
        .assert.summary.balance('400');
      await search
        .percySnapshot('after renting');
    });

    it('does not show a rent button when bankrupt', async function() {
      await this.grm.mock({
        room: 't35tt',
        players: [{ token: 'top-hat', bankrupt: true }]
      });

      await search
        .input.type('penn')
        .assert.property.name('PENNSYLVANIA AVENUE')
        .assert.property.rentBtn.not.exists();
    });

    describe('renting utilities', () => {
      beforeEach(async () => {
        await search
          .input.type('wat')
          .assert.property.name('WATER WORKS')
          .assert.property.rentBtn.text(/Pay Rent .\(x4\)/s)
          .property.rentBtn.click();
      });

      it('shows a utility rent form', async () => {
        await search
          .assert.utilForm.exists()
          .assert.utilForm.value('2')
          .percySnapshot('utility rent');
      });

      it('can enter a custom dice roll', async () => {
        await search.utilForm.only()
          .assert.value('2')
          .input.press('Backspace')
          .input.type('10')
          .assert.value('10');
      });

      it('can click for a random dice roll', async () => {
        await search.utilForm.only()
          .assert.value('2')
          .rollBtn.click()
          .assert.not.value('2');
      });

      it('disables the submit button when the roll is outside of the range', async () => {
        await search.utilForm.only()
          .assert.value('2')
          .assert.submitBtn.not.disabled()
          .input.press('Backspace')
          .input.type('15')
          .assert.value('15')
          .assert.submitBtn.disabled();
      });

      it('clamps the roll amount after blurring when outside of the range', async () => {
        await search.utilForm.only()
          .input.focus()
          .input.press('Backspace')
          .input.type('0')
          .assert.value('0')
          .assert.submitBtn.disabled()
          .input.blur()
          .assert.value('2')
          .assert.submitBtn.not.disabled();

        await search.utilForm.only()
          .input.focus()
          .input.press('Backspace')
          .input.type('20')
          .assert.value('20')
          .assert.submitBtn.disabled()
          .input.blur()
          .assert.value('12')
          .assert.submitBtn.not.disabled();
      });

      it('navigates to the dashboard after renting', async () => {
        await search.utilForm.only()
          .submitBtn.click();
        await dashboard
          .assert.exists()
          .assert.toast.message('YOU paid PLAYER 2 rent for Water Works')
          .assert.summary.balance('1,492');
      });
    });
  });
});
