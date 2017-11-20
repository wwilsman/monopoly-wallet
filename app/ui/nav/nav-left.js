import React from 'react';
import styles from './nav.css';

function NavLeft(props) {
  return (
    <div className={styles['left']} {...props}/>
  );
}

export default NavLeft;
