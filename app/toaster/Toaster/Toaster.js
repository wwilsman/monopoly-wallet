import React, { Component, PropTypes } from 'react'
import styles from './Toaster.css'

import Toast from '../Toast'

class Toaster extends Component {
  static propTypes = {
    toasts: PropTypes.array.isRequired,
    removeToast: PropTypes.func.isRequired,
    clearTimedToasts: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired
  }

  componentWillUnmount() {
    this.props.clearTimedToasts()
  }

  render() {
    const { toasts, removeToast, dispatch } = this.props

    return (
      <div className={styles.root}>
        {toasts.map(({ _id, ...toast }) => (
           <Toast
               key={_id}
               onDismiss={() => removeToast(_id)}
               dispatch={dispatch}
               {...toast}
           />
         ))}
      </div>
    )
  }
}

export default Toaster
