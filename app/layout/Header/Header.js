import React from 'react'
import styles from './Header.css'

import Section from '../Section'

const Header = ({ children }) => (
  <Section
      size="1/8"
      direction="row"
      justify="center"
      className={styles.root}>
    {children}
  </Section>
)

export default Header
