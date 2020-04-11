import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './layout.css';

const cx = classNames.bind(styles);

Section.propTypes = {
  row: PropTypes.bool,
  collapse: PropTypes.bool,
  flex: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.oneOf(['none'])
  ]),
  align: PropTypes.oneOf([
    'center',
    'start'
  ]),
  justify: PropTypes.oneOf([
    'center',
    'start',
    'between',
    'stretch'
  ]),
  className: PropTypes.string
};

export default function Section({
  row,
  flex,
  align,
  justify,
  collapse,
  className,
  ...props
}) {
  return (
    <div
      className={cx('section', {
        [`align-${align}`]: !!align,
        [`justify-${justify}`]: !!justify,
        'is-collapsed': collapse,
        row
      }, className)}
      style={!!flex ? { flex } : null}
      {...props}
    />
  );
}
