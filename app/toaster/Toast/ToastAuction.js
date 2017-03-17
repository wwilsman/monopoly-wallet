import React, { PropTypes } from 'react'
import styles from './Toast.css'

import Toast from './Toast'
import { Flex } from '../../layout'
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

  _handleJoinAuction = () => {
    const { push, match } = this.context.router
    push(`/${match.params.room}/auction`)
  }

  render() {
    const { property, onConcede } = this.props

    return (
      <Flex row align="center" justify="space-between" className={styles.root}>
        {this.renderMessage()}

        <Flex row align="center" className={styles.buttons}>
          <Button tiny onClick={() => onConcede(property)}>Concede</Button>
          <Button tiny onClick={this._handleJoinAuction}>Join</Button>
        </Flex>
      </Flex>
    )
  }
}

export default ToastAuction
