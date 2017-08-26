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
  dispatch,
  dismiss,
  actions = [],
  ...props
}) {
  const className = cx('toast', {
    [`is-${type}`]: !!type
  });

  return (
    <div className={className} {...dataAttrs(props)}>
      <div className={styles.message}>
        <span>{message}</span>

        {type !== 'attention' && (
          <button onClick={dismiss}>
            <Icon name={type === 'success' ? 'check' : 'close'}/>
          </button>
        )}
      </div>

      {type === 'attention' && (
        <div className={styles.actions}>
          {actions.map(({ label, actions }, i) => (
            <button key={i} onClick={() => actions.forEach(dispatch)}>
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
    'attention',
    'default',
    'success'
  ]).isRequired,
  message: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  dismiss: PropTypes.func,
  actions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    actions: PropTypes.arrayOf(PropTypes.object).isRequired
  }))
};

export default Toast;
