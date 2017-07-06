/* global describe, it */
import { expect } from 'chai';

import {
  setupAppForAcceptanceTesting
} from '../acceptance-helpers';

describe('App: welcome screen', function() {
  setupAppForAcceptanceTesting();

  it('shows a welcome message', function() {
    expect(this.app.find('h1')).to.have.text('Hello Monopoly');
  });
});
