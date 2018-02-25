import React from 'react';
import styles from './typography.css';

function Title (props) {
  return (
    <h1 className={styles.title} {...props}/>
  );
}

export default Title;
