import React, { PropTypes } from 'react'
import styles from './Toast.css'

import { Flex } from '../../layout'
import { Button, Icon } from '../../common'

import Toast from './Toast'

class ToastError extends Toast {

  render() {
    const { onDismiss } = this.props

    return (
      <Flex className={[styles.root, styles.error].join(' ')}>
        {this.renderMessage()}

        <Flex className={styles.buttons}>
          <Button small onClick={onDismiss}>
            <Icon name="x" className={styles.dismiss}/>
          </Button>
        </Flex>
      </Flex>
    )
  }
}

export default ToastError
