import React from 'react';
import styles from './nav.css';

function NavRight(props) {
  return (
    <div className={styles['right']} {...props}/>
  );
}

export default NavRight;
