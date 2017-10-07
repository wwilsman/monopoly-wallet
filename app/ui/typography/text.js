import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './typography.css';

const cx = classNames.bind(styles);

const Text = ({ center, error, className, ...props }) => (
  <span
      className={cx(className, {
        'is-center': center,
        'is-error': error
      })}
      {...props}/>
);

Text.propTypes = {
  center: PropTypes.bool,
  error: PropTypes.bool,
  className: PropTypes.string
};

export default Text;
