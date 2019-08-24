import { setupApplication } from '../helpers';

import SearchInteractor from '../interactors/search';

describe('PropertiesScreen', () => {
  const search = new SearchInteractor();

  setupApplication(async function () {
    await this.grm.mock({
      room: 't35tt',
      players: [
        { token: 'top-hat' }
      ]
    });

    this.ls.data.room = 't35tt',
    this.ls.data.player = { name: 'PLAYER 1', token: 'top-hat' };
    await search.visit();
  });

  it('shows the properties screen', async () => {
    await search
      .assert.exists()
      .percySnapshot();
  });

  it('shows the room code', async () => {
    await search
      .assert.roomCode('T35TT');
  });

  it('shows a properties icon and heading', async () => {
    await search
      .assert.heading.text('PROPERTIES')
      .assert.heading.icon('bank');
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
      .assert.remains()
      .percySnapshot('with a search');
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
      .assert.property.rent(0).text('18')
      .assert.property.rentLabels(1).text('Rent with Monopoly')
      .assert.property.rent(1).text('36')
      .assert.property.rentLabels(2).text('Rent with ')
      .assert.property.rent(2).text('90')
      .assert.property.rentLabels(3).text('Rent with ')
      .assert.property.rent(3).text('250')
      .assert.property.rentLabels(4).text('Rent with ')
      .assert.property.rent(4).text('700');
  });

  it('shows a property\'s price, mortgage value, and build costs', async () => {
    await search
      .input.type('park')
      .assert.property.name('PARK PLACE')
      .assert.property.group('blue')
      .assert.property.price('200')
      .assert.property.mortgage('100')
      .assert.property.cost('100');
  });
});
