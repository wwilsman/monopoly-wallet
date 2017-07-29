import React from 'react';
import PropTypes from 'prop-types';
import styles from './typography.css';

const Heading = (props) => (
  <h1 className={styles.heading} {...props}/>
);

export default Heading;
