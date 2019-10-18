import React from 'react';
import PropTypes from 'prop-types';

import Link from '../link';
import styles from './card.css';

Card.propTypes = {
  linkTo: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired
};

export default function Card({
  linkTo,
  onClick,
  children
}) {
  return linkTo ? (
    <Link
      to={linkTo}
      className={styles.root}
      data-test-card
    >
      {children}
    </Link>
  ) : (
    <button
      onClick={onClick}
      className={styles.root}
      data-test-card
    >
      {children}
    </button>
  );
}
