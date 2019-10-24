import React from 'react';
import PropTypes from 'prop-types';

import Link from '../link';
import styles from './card.css';

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
  let Component = linkTo ? Link : 'button';
  let props = linkTo ? { to: linkTo } : { onClick };

  return (
    <Component
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-test-card
      {...props}
    >
      {children}
    </Component>
  );
}
