import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './spinner.css';

const cx = classNames.bind(styles);

function Spinner({ xl, ...props }) {
  return (
    <span
        className={cx('root', {
          'size--xl': xl
        })}
        {...props}/>
  );
}

Spinner.propTypes = {
  xl: PropTypes.bool
};

export default Spinner;
