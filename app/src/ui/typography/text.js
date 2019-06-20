import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import Icon from '../icon';

import styles from './typography.css';

const cx = classNames.bind(styles);

Text.propTypes = {
  color: PropTypes.oneOf([
    'primary',
    'secondary',
    'light',
    'lighter'
  ]),
  center: PropTypes.bool,
  error: PropTypes.bool,
  sm: PropTypes.bool,
  xl: PropTypes.bool,
  upper: PropTypes.bool,
  icon: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node
};

export default function Text({
  color,
  center,
  error,
  sm,
  xl,
  upper,
  icon,
  className,
  children,
  ...props
}) {
  return (
    <span
      className={cx('root', {
        [`color--${color}`]: !!color,
        'with-icon': !!icon,
        'is-center': center,
        'is-error': error,
        'is-upper': upper,
        'size--sm': sm,
        'size--xl': xl
      }, className)}
      {...props}
    >
      {!icon ? children : (
        <>
          <Icon name={icon} className={styles.icon} data-test-text-icon/>
          <span>{children}</span>
        </>
      )}
    </span>
  );
}
