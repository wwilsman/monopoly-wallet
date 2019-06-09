import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './layout.css';

const cx = classNames.bind(styles);

Container.propTypes = {
  row: PropTypes.bool,
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
  tagName: PropTypes.string
};

export default function Container({
  row,
  align,
  justify,
  tagName: Component = 'div',
  ...props
}) {
  return (
    <Component
      className={cx('container', {
        [`align-${align}`]: !!align,
        [`justify-${justify}`]: !!justify,
        row: !!row
      })}
      {...props}
    />
  );
}
