import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  setupRoomForTesting,
  emitSocketEvent,
  promisifySocketEvent,
  createSocketAndJoinGame
} from '../room-helpers';

import MonopolyError from '../../../server/error';

describe('Room: actions', function() {
  setupRoomForTesting();

  const actionTests = [
    { event: 'player:transfer', args: [100] },
    { event: 'player:claim-bankruptcy', args: [] },
    { event: 'property:buy', args: ['oriental-avenue'] },
    { event: 'property:improve', args: ['oriental-avenue'] },
    { event: 'property:unimprove', args: ['oriental-avenue'] },
    { event: 'property:mortgage', args: ['oriental-avenue'] },
    { event: 'property:unmortgage', args: ['oriental-avenue'] },
    { event: 'property:pay-rent', args: ['oriental-avenue'] },
    { event: 'auction:new', args: ['oriental-avenue'] },
    { event: 'auction:bid', args: [100] },
    { event: 'auction:concede', args: [] },
    { event: 'trade:new', args: ['automobile', { properties: ['oriental-avenue'] }] },
    { event: 'trade:decline', args: ['automobile'] },
    { event: 'trade:accept', args: ['automobile'] }
  ];

  actionTests.forEach(({ event, args }) => {
    const promisedAction = async (gameId) => {
      let ws = await createSocketAndJoinGame(gameId, 'top-hat');
      let promised = promisifySocketEvent(ws, 'game:update');
      emitSocketEvent(ws, event, ...args);
      return promised;
    };

    it(`should respond to "${event}"`, async function() {
      await expect(promisedAction(this.room).catch((error) => {
        expect(error).to.be.an.instanceof(MonopolyError);
      })).to.be.fulfilled;
    });
  });
});
