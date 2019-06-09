import React from 'react';
import styles from './nav.css';

export default function NavLeft(props) {
  return (
    <div className={styles['left']} {...props}/>
  );
}
