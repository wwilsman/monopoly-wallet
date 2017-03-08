import React, { PropTypes } from 'react'
import styles from './Toast.css'

import Toast from './Toast'
import { Icon, Button } from '../../common'

class ToastNotice extends Toast {

  render() {
    const { onDismiss } = this.props

    return (
      <div className={styles.root}>
        {this.renderMessage()}

        <div className={styles.buttons}>
          <Button small onClick={onDismiss}>
            <Icon name="x" className={styles.dismiss}/>
          </Button>
        </div>
      </div>
    )
  }
}

export default ToastNotice
