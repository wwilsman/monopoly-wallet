/* global describe, beforeEach, it */
import { expect } from 'chai';

import {
  setupAppForAcceptanceTesting,
  visit
} from '../acceptance-helpers';

describe('App: welcome screen', function() {
  setupAppForAcceptanceTesting();

  it('should display the app name', function() {
    expect(this.$.find('h1')).to.have.text('MonopolyWallet');
  });

  it('should redirect back to welcome on 404', function() {
    visit('/404-not-found');
    expect(this.location.pathname).to.equal('/');
  });
});
