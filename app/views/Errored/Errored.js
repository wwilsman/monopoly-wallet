import React from 'react'
import styles from './Errored.css'

import { Flex, Box, Title } from '../../layout'

const Errored = ({ title = 'Error', message }) => (
  <Flex className={styles.root}>
    <Box stretch justify="center">
      <Title className={styles.title} large>{title}</Title>
      <span className={styles.message}>{message}</span>
    </Box>
  </Flex>
)

export default Errored
