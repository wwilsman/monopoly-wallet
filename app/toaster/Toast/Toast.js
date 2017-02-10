import React, { Component, PropTypes } from 'react'
import className from 'classnames/bind'
import styles from './Toast.css'

const cx = className.bind(styles)

import { Button, Icon } from '../../common'

class Toast extends Component {
  static propTypes = {
    onDismiss: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    type: PropTypes.oneOf([
      'notice',
      'error',
      'poll'
    ]).isRequired,
    content: PropTypes.string.isRequired,
    timeout: PropTypes.number,
    buttons: PropTypes.array
  }

  componentDidMount() {
    const { timeout, onDismiss } = this.props

    if (timeout) {
      this._timeout = setTimeout(onDismiss, timeout)
    }
  }

  componentWillUnmount() {
    if (this._timeout) {
      clearTimeout(this._timeout)
    }
  }

  render() {
    const {
      type,
      content,
      buttons,
      onDismiss,
      dispatch
    } = this.props

    return (
      <div className={cx('root', {
          'error': type === 'error',
          'poll': type === 'poll'
        })}>
        <Text sm>{content}</Text>

        <div className={styles.buttons}>
          {buttons ? buttons.map((btn, i) => (
             <Button
                 key={i}
                 className={!i && styles.unimportant}
                 onClick={() => {
                     dispatch(btn.action)
                     onDismiss()
                   }}
                 small>
               {btn.label}
             </Button>
           )) : (
             <Button small onClick={onDismiss}>
               <Icon name="x" className={styles.dismiss}/>
             </Button>
           )}
        </div>
      </div>
    )
  }
}

export default Toast
