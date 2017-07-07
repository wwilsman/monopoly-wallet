/* global describe, beforeEach, it */
import { expect } from 'chai';

import {
  setupAppForAcceptanceTesting
} from '../acceptance-helpers';

describe('App: welcome screen', function() {
  setupAppForAcceptanceTesting();

  it('should display the app name', function() {
    expect(this.$.find('h1')).to.have.text('MonopolyWallet');
  });
});
