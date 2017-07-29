import React from 'react';
import PropTypes from 'prop-types';
import styles from './typography.css';

const Title = (props) => (
  <h1 className={styles.title} {...props}/>
);

export default Title;
