import React from 'react';
import styles from './typography.css';

function Heading(props) {
  return (
    <h1 className={styles.heading} {...props}/>
  );
}

export default Heading;
