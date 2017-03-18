import React, { Component, PropTypes } from 'react'
import className from 'classnames/bind'
import styles from './Toaster.css'

const cx = className.bind(styles)

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

  static contextTypes = {
    router: PropTypes.shape({
      listen: PropTypes.func.isRequired
    }).isRequired
  }

  state = {
    inAuction: false
  }

  componentDidMount() {
    const { listen } = this.context.router

    this.unlisten = listen(({ pathname }) => {
      const inAuction = /\/auction\/?$/.test(pathname)
      this.setState({ inAuction })
    })
  }

  componentWillUnmount() {
    this.props.clearTimedToasts()
    this.unlisten()
  }

  getPlayerNameMap(
    players = this.props.players,
    currentPlayer = this.props.currentPlayer
  ) {
    return players.reduce((names, player) => {
      names[player.token] = player.name

      if (player.token === currentPlayer) {
        names[player.token] = 'You'
      }

      return names
    }, {})
  }

  render() {
    const {
      toasts,
      removeToast,
      voteInPoll,
      concedeAuction
    } = this.props

    const { inAuction } = this.state
    const playerNames = this.getPlayerNameMap()
    const sortedToasts = inAuction ? [...toasts].reverse() : toasts

    return (
      <Flex className={cx('root', {
          'position-top': inAuction
        })}>
        {sortedToasts.map(({ _id, type, ...toast }) => {
           toast.onDismiss = () => removeToast(_id)
           toast.players = playerNames
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
             (!inAuction && (
               <ToastAuction
                   onConcede={(p) => {
                       concedeAuction(p)
                       removeToast(_id)
                     }}
                   {...toast}
               />
             ))
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
