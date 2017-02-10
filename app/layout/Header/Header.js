import React from 'react'
import styles from './Header.css'

import Box from '../Box'

const Header = ({ children }) => (
  <Box size="1/8" direction="row" justify="center"
       className={styles.root}>
    {children}
  </Box>
)

export default Header
