import React, { PropTypes } from 'react'
import styles from './Toast.css'

import Toast from './Toast'
import { Button } from '../../common'

class ToastAuction extends Toast {
  static propTypes = {
    ...Toast.propTypes,
    onConcede: PropTypes.func.isRequired,
    property: PropTypes.string.isRequired
  }

  static contextTypes = {
    router: PropTypes.shape({
      push: PropTypes.func.isRequired,
      match: PropTypes.shape({
        params: PropTypes.shape({
          room: PropTypes.string.isRequired
        }).isRequired
      }).isRequired
    }).isRequired
  }

  _goToAuction = () => {
    const { push, match } = this.context.router
    push(`/${match.params.room}/auction`)
    this.props.onDismiss()
  }

  render() {
    const { property, onConcede } = this.props

    return (
      <div className={styles.root}>
        {this.renderMessage()}

        <div className={styles.buttons}>
          <Button small onClick={() => onConcede(property)}>
            Concede
          </Button>

          <Button small onClick={this._goToAuction}>
            Join
          </Button>
        </div>
      </div>
    )
  }
}

export default ToastAuction
