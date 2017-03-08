import React, { PropTypes } from 'react'
import styles from './Toast.css'

import Toast from './Toast'
import { Icon, Button } from '../../common'

class ToastPoll extends Toast {

  render() {
    const { onDismiss, onVote } = this.props

    return (
      <div className={[styles.root, styles.poll].join(' ')}>
        {this.renderMessage()}

        <div className={styles.buttons}>
          <Button small onClick={() => onVote(false)}>
            No
          </Button>

          <Button small onClick={() => onVote(true)}>
            Yes
          </Button>
        </div>
      </div>
    )
  }
}

export default ToastPoll
