import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './spinner.css';

const cx = classNames.bind(styles);

Spinner.propTypes = {
  xl: PropTypes.bool
};

export default function Spinner({ xl }) {
  return (
    <span
      className={cx('root', { 'size--xl': xl })}
      data-test-spinner
    />
  );
}
