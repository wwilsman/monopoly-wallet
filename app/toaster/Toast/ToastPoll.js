import React, { PropTypes } from 'react'
import styles from './Toast.css'

import { Flex } from '../../layout'
import { Button, Icon } from '../../common'

import Toast from './Toast'

class ToastPoll extends Toast {

  render() {
    const { onDismiss, onVote } = this.props

    const className = [styles.root, styles.attention].join(' ')

    return (
      <Flex row align="center" justify="space-between" className={className}>
        {this.renderMessage()}

        <Flex row align="center" className={styles.buttons}>
          <Button small onClick={() => onVote(false)}>No</Button>
          <Button small onClick={() => onVote(true)}>Yes</Button>
        </Flex>
      </Flex>
    )
  }
}

export default ToastPoll
