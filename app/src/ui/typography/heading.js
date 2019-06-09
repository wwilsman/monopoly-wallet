import React from 'react';
import styles from './typography.css';

export default function Heading(props) {
  return (
    <h1 className={styles.heading} {...props}/>
  );
}
