import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './layout.css';

const cx = classNames.bind(styles);

Container.propTypes = {
  row: PropTypes.bool,
  scrollable: PropTypes.bool,
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
  tagName: PropTypes.string,
  className: PropTypes.string
};

export default function Container({
  row,
  align,
  justify,
  scrollable,
  tagName: Component = 'div',
  className,
  ...props
}) {
  return (
    <Component
      className={cx('container', {
        [`align-${align}`]: !!align,
        [`justify-${justify}`]: !!justify,
        row: !!row,
        'scroll-y': !!scrollable
      }, className)}
      {...props}
    />
  );
}
