import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './toaster.css';

import Icon from '../icon';

const cx = classNames.bind(styles);

Toast.propTypes = {
  type: PropTypes.oneOf([
    'alert',
    'poll',
    'default',
    'message'
  ]).isRequired,
  message: PropTypes.string.isRequired,
  dismiss: PropTypes.func,
  timeout: PropTypes.number,
  actions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    action: PropTypes.func.isRequired
  }))
};

export default function Toast({
  type,
  message,
  dismiss,
  timeout,
  actions
}) {
  useEffect(() => {
    if (timeout && dismiss) {
      let t = setTimeout(dismiss, timeout);
      return () => clearTimeout(t);
    }
  }, [timeout, dismiss]);

  return (
    <div
      className={cx('toast', { [`is-${type}`]: !!type })}
      data-test-toast={type}
    >
      <div className={styles.message}>
        <span data-test-toast-message>
          {message}
        </span>

        {!!dismiss && (
          <button onClick={dismiss}>
            <Icon name={type === 'message' ? 'check' : 'close'}/>
          </button>
        )}
      </div>

      {!!actions && (
        <div className={styles.actions} data-test-actions>
          {actions.map(({ label, action }, i) => (
            <button key={i} onClick={action}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
