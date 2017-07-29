import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './typography.css';

const cx = classNames.bind(styles);

const Text = ({ center, error, ...props }) => (
  <span {...props}
        className={cx({
          'is-center': center,
          'is-error': error
        })}/>
);

Text.propTypes = {
  center: PropTypes.bool,
  error: PropTypes.bool
};

export default Text;
