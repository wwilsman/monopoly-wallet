import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './typography.css';

const cx = classNames.bind(styles);

const Text = ({
  color,
  center,
  error,
  sm,
  upper,
  className,
  ...props
}) => (
  <span
      className={cx(className, {
        [`color--${color}`]: !!color,
        'is-center': center,
        'is-error': error,
        'is-upper': upper,
        'size--sm': sm
      })}
      {...props}/>
);

Text.propTypes = {
  color: PropTypes.oneOf(['primary', 'secondary']),
  center: PropTypes.bool,
  error: PropTypes.bool,
  sm: PropTypes.bool,
  upper: PropTypes.bool,
  className: PropTypes.string
};

export default Text;
