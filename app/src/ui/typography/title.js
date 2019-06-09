import React from 'react';
import styles from './typography.css';

export default function Title(props) {
  return (
    <h1 className={styles.title} {...props}/>
  );
}
