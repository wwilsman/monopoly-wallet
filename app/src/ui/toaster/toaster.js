import React, { useEffect, useReducer } from 'react';
import styles from './toaster.css';

import { useEmit, useGame, useEmitter } from '../../api';
import { useOwnNameFormatter } from '../../helpers/hooks';
import Toast from './toast';

function toastReducer(state, action) {
  if (action.add) {
    return state.concat({
      id: action.id,
      type: typeof action.add === 'string' ? action.add : 'default',
      message: action.message
    });
  } else if (action.remove) {
    return state.filter(({ id }) => (
      id !== action.remove
    ));
  } else {
    return state;
  }
}

export default function Toaster() {
  let game = useGame();
  let emitter = useEmitter();
  let [ toasts, updateToasts ] = useReducer(toastReducer, []);
  let [ vote, voted ] = useEmit('poll:vote');
  let format = useOwnNameFormatter();

  useEffect(() => {
    let last = 0;

    let handleNotice = (type, state) => {
      let { timestamp, notice } = state ?? {};

      if (notice && timestamp > last) {
        last = timestamp;

        updateToasts({
          add: type,
          id: timestamp,
          message: notice.message
        });
      }
    };

    let onUpdate = state => {
      handleNotice('default', state);
    };

    let onResponse = (_, response) => {
      handleNotice('message', response);
    };

    let onError = (_, { message }) => {
      updateToasts({ add: 'alert', id: Date.now(), message });
    };

    let onPollStart = (id, message) => {
      updateToasts({ add: 'poll', id, message });
    };

    let onPollEnd = id => {
      updateToasts({ remove: id });
    };

    if (game.timestamp) {
      handleNotice('message', game);
    }

    emitter.on('game:update', onUpdate);
    emitter.on('response:ok', onResponse);
    emitter.on('response:error', onError);
    emitter.on('poll:new', onPollStart);
    emitter.on('poll:end', onPollEnd);

    return () => {
      emitter.off('game:update', onUpdate);
      emitter.off('response:ok', onResponse);
      emitter.off('response:error', onError);
      emitter.off('poll:new', onPollStart);
      emitter.off('poll:end', onPollEnd);
    };
  }, []);

  useEffect(() => {
    if (voted.ok && !voted.pending) {
      let [id] = voted.data;
      updateToasts({ remove: id });
    }
  }, [voted.pending]);

  return (
    <div className={styles.root} data-test-toaster>
      {toasts.map(({ id, type, message }) => {
        if (type === 'poll') {
          return (
            <Toast
              key={id}
              type={type}
              message={format(message)}
              actions={[
                { label: 'Yes', action: () => vote(id, true) },
                { label: 'No', action: () => vote(id, false) }
              ]}
            />
          );
        } else {
          return (
            <Toast
              key={id}
              type={type}
              message={format(message)}
              dismiss={() => updateToasts({ remove: id })}
              timeout={5 * 1000}
            />
          );
        }
      })}
    </div>
  );
}
