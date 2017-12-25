import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './typography.css';

const cx = classNames.bind(styles);

function Text({
  color,
  center,
  error,
  sm,
  xl,
  upper,
  className,
  ...props
}) {
  return (
    <span
        className={cx('root', {
          [`color--${color}`]: !!color,
          'is-center': center,
          'is-error': error,
          'is-upper': upper,
          'size--sm': sm,
          'size--xl': xl
        }, className)}
        {...props}/>
  );
}

Text.propTypes = {
  color: PropTypes.oneOf(['primary', 'secondary']),
  center: PropTypes.bool,
  error: PropTypes.bool,
  sm: PropTypes.bool,
  xl: PropTypes.bool,
  upper: PropTypes.bool,
  className: PropTypes.string
};

export default Text;
