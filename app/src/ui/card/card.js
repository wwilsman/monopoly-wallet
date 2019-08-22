import React from 'react';
import PropTypes from 'prop-types';

import Link from '../link';
import styles from './card.css';

Card.propTypes = {
  linkTo: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

export default function Card({
  linkTo,
  children
}) {
  return (
    <Link
      to={linkTo}
      className={styles.root}
      data-test-card
    >
      {children}
    </Link>
  );
}
