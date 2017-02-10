import React from 'react'
import styles from './Modal.css'

import { Flex, Box, Header, Title } from '../../layout'
import { Button, Icon } from '../'

const Modal = ({ title, footer, onClose, children }) => (
  <Flex className={styles.root}>
    <Header>
      <Button icon onClick={onClose}>
        <Icon name="x"/>
      </Button>

      {title && (
         <Title>{title}</Title>
       )}
    </Header>

    <Box stretch>
      <div className={styles.modal}>
        {children}
      </div>
    </Box>

    <Box size="1/8">
      {footer}
    </Box>
  </Flex>
)

export default Modal
