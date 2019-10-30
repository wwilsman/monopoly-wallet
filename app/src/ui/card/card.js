import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import Link from '../link';
import styles from './card.css';

const cx = classNames.bind(styles);

Card.propTypes = {
  linkTo: PropTypes.any,
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default function Card({
  linkTo,
  onClick,
  className,
  children
}) {
  let Component = linkTo ? Link : 'div';
  let props = linkTo ? { to: linkTo } : { onClick };

  return (
    <Component
      className={cx('root', {
        'is-clickable': !!(linkTo || onClick)
      }, className)}
      data-test-card
      {...props}
    >
      {children}
    </Component>
  );
}
