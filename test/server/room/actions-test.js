import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  setupRoomForTesting,
  createSocketAndJoinGame,
  promisifySocketEvent
} from '../room-helpers';

import MonopolyError from '../../../server/error';

describe('Room: actions', function() {
  let socket;

  setupRoomForTesting({
    async beforeEach() {
      socket = await createSocketAndJoinGame(this.room, 'top-hat');
    }
  });

  const actionTests = [
    { emit: 'player:transfer', args: [100] },
    { emit: 'player:claim-bankruptcy', args: [] },
    { emit: 'property:buy', args: ['oriental-avenue'] },
    { emit: 'property:improve', args: ['oriental-avenue'] },
    { emit: 'property:unimprove', args: ['oriental-avenue'] },
    { emit: 'property:mortgage', args: ['oriental-avenue'] },
    { emit: 'property:unmortgage', args: ['oriental-avenue'] },
    { emit: 'property:pay-rent', args: ['oriental-avenue'] },
    { emit: 'auction:new', args: ['oriental-avenue'] },
    { emit: 'auction:bid', args: [100] },
    { emit: 'auction:concede', args: [] },
    { emit: 'trade:new', args: ['automobile', { properties: ['oriental-avenue'] }] },
    { emit: 'trade:decline', args: ['automobile'] },
    { emit: 'trade:accept', args: ['automobile'] }
  ];

  actionTests.forEach((actionTest) => {
    const promisedAction = () => {
      return promisifySocketEvent(socket, {
        emit: actionTest.emit,
        resolve: 'game:sync',
        reject: 'game:error'
      })(...actionTest.args);
    };

    it(`should respond to "${actionTest.emit}"`, async function() {
      await promisedAction().catch((error) => {
        expect(error).to.be.an.instanceof(MonopolyError);
      });
    });
  });
});
