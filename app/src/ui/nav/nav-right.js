import React from 'react';
import styles from './nav.css';

export default function NavRight(props) {
  return (
    <div className={styles['right']} {...props}/>
  );
}
