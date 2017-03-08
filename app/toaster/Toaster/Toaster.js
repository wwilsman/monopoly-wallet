import React, { Component, PropTypes } from 'react'
import styles from './Toaster.css'

import { Flex } from '../../layout'

import {
  ToastNotice,
  ToastError,
  ToastPoll,
  ToastAuction
} from '../Toast'

class Toaster extends Component {
  static propTypes = {
    toasts: PropTypes.array.isRequired,
    players: PropTypes.array.isRequired,
    removeToast: PropTypes.func.isRequired,
    clearTimedToasts: PropTypes.func.isRequired,
    voteInPoll: PropTypes.func.isRequired,
    concedeAuction: PropTypes.func.isRequired,
    currentPlayer: PropTypes.string
  }

  static childContextTypes = {
    players: PropTypes.object.isRequired,
  }

  componentWillUnmount() {
    this.props.clearTimedToasts()
  }

  getChildContext() {
    return {
      players: this.props.players.reduce((names, player) => {
        names[player.token] = player.name.toUpperCase()

        if (player.token === this.props.currentPlayer) {
          names[player.token] = 'YOU'
        }

        return names
      }, {})
    }
  }

  render() {
    const {
      toasts,
      removeToast,
      voteInPoll,
      concedeAuction
    } = this.props

    return (
      <Flex className={styles.root}>
        {toasts.map(({ _id, type, ...toast }) => {
           toast.onDismiss = () => removeToast(_id)
           toast.key = _id

           return (type === 'poll' ? (
             <ToastPoll
                 onVote={(v) => {
                     voteInPoll(_id, v)
                     removeToast(_id)
                   }}
                 {...toast}
             />
           ) : type === 'auction' ? (
             <ToastAuction
                 onConcede={(p) => {
                     concedeAuction(p)
                     removeToast(_id)
                   }}
                 {...toast}
             />
           ) : type === 'error' ? (
             <ToastError {...toast}/>
           ) : (
             <ToastNotice {...toast}/>
           ))
         })}
      </Flex>
    )
  }
}

export default Toaster
