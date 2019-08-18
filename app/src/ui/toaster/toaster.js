import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import styles from './toaster.css';

import { useEmit, useGame, useEmitter } from '../../api';
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
  let [ toasts, updateToasts ] = useReducer(toastReducer, []);
  let [ vote, voted ] = useEmit('poll:vote');
  let { player, notice } = useGame();
  let emitter = useEmitter();

  let nameReg = useMemo(() => (
    new RegExp(`(^|\\s+)${player.name}(\\s+|$)`)
  ), [player.name]);

  let formatMessage = useCallback(message => (
    message.replace(nameReg, '$1YOU$2')
  ), [nameReg]);

  useEffect(() => {
    let last = 0;

    let handleNotice = (type, notice) => {
      if (notice?.timestamp > last) {
        last = notice.timestamp;

        updateToasts({
          add: type,
          id: notice.timestamp,
          message: notice.message
        });
      }
    };

    let onUpdate = ({ notice }) => {
      handleNotice('default', notice);
    };

    let onResponse = (_, { notice } = {}) => {
      handleNotice('message', notice);
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

    if (notice) {
      handleNotice('message', notice);
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
    <div className={styles.root}>
      {toasts.map(({ id, type, message }) => {
        if (type === 'poll') {
          return (
            <Toast
              key={id}
              type={type}
              message={formatMessage(message)}
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
              message={formatMessage(message)}
              dismiss={() => updateToasts({ remove: id })}
              timeout={5 * 1000}
            />
          );
        }
      })}
    </div>
  );
}
