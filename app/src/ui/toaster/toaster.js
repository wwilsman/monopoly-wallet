import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import styles from './toaster.css';

import { useToastActions } from '../../redux/actions';
import { useApp } from '../../utils';
import Toast from './toast';

export default function Toaster() {
  let { player } = useApp();
  let toasts = useSelector(({ toasts }) => toasts);
  let { removeToast, voteInPoll } = useToastActions();

  let formatMessage = useCallback(message => {
    let nameReg = new RegExp(`(^|\\s+)${player.name}(\\s+|$)`);
    return message.replace(nameReg, '$1YOU$2');
  }, [player.name]);

  let vote = (id, v) => () => {
    voteInPoll(id, v);
    removeToast(id);
  };

  return (
    <div className={styles.root}>
      {toasts.map(toast => {
        if (toast.type === 'poll') {

          return (
            <Toast
              key={toast.id}
              type={toast.type}
              message={formatMessage(toast.message)}
              actions={[
                { label: 'Yes', action: vote(toast.id, true) },
                { label: 'No', action: vote(toast.id, false) }
              ]}
            />
          );
        } else {
          return (
            <Toast
              key={toast.id}
              type={toast.type}
              message={formatMessage(toast.message)}
              dismiss={() => removeToast(toast.id)}
              timeout={10 * 1000}
            />
          );
        }
      })}
    </div>
  );
}
