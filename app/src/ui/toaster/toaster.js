import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './toaster.css';

import {
  removeToast,
  voteInPoll
} from '../../redux/toasts';

import Toast from './toast';

export default function Toaster() {
  let player = useSelector(({ app: { player } }) => player);
  let toasts = useSelector(({ toasts }) => toasts);
  let dispatch = useDispatch();

  let formatMessage = useCallback(message => {
    let nameReg = new RegExp(`(^|\\s+)${player.name}(\\s+|$)`);
    return message.replace(nameReg, '$1YOU$2');
  }, [player.name]);

  let vote = (id, v) => () => {
    dispatch(voteInPoll(id, v));
    dispatch(removeToast(id));
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
              dismiss={() => dispatch(removeToast(toast.id))}
            />
          );
        }
      })}
    </div>
  );
}
