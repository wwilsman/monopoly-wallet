import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { dataAttrs } from '../../utils';
import styles from './toaster.css';

import Icon from '../icon';

const cx = classNames.bind(styles);

function Toast({
  type,
  message,
  dismiss,
  actions,
  ...props
}) {
  const className = cx('toast', {
    [`is-${type}`]: !!type
  });

  return (
    <div className={className} {...dataAttrs(props)}>
      <div className={styles.message}>
        <span>{message}</span>

        {!!dismiss && (
          <button onClick={dismiss}>
            <Icon name={type === 'success' ? 'check' : 'close'}/>
          </button>
        )}
      </div>

      {!!actions && (
        <div className={styles.actions}>
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

Toast.propTypes = {
  type: PropTypes.oneOf([
    'alert',
    'poll',
    'default',
    'success'
  ]).isRequired,
  message: PropTypes.string.isRequired,
  dismiss: PropTypes.func,
  actions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    action: PropTypes.func.isRequired
  }))
};

export default Toast;
