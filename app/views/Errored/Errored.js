import React from 'react'
import styles from './Errored.css'

import { Flex, Section, Text, Title } from '../../layout'

const Errored = ({ name = 'Error', message }) => (
  <Flex container className={styles.root}>
    <Section stretch justify="center">
      <Title lg className={styles.title}>{name}</Title>
      <Text center>{message}</Text>
    </Section>
  </Flex>
)

export default Errored
