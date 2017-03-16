import React from 'react'
import styles from './Modal.css'

import { Flex, Header, Section, Title } from '../../layout'
import { Button, Icon } from '../'

const Modal = ({
  title,
  footer,
  onClose,
  children
}) => (
  <Flex container className={styles.root}>
    <Header>
      <Button icon onClick={onClose}>
        <Icon name="x"/>
      </Button>

      {title && (
         <Title>{title}</Title>
       )}
    </Header>

    <Section stretch>
      <Flex className={styles.modal}>
        {children}
      </Flex>
    </Section>

    <Section size="1/8">
      {footer}
    </Section>
      </Flex>
)

export default Modal
