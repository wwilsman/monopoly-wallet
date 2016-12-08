import React, { Component, PropTypes } from 'react'
import { View, Text } from 'react-native'
import io from 'socket.io-client'
import {
  Container,
  Header,
  Title,
  Content,
  Centered,
  Footer
} from '../layout'

import { ThemeIcons } from '../core/components'
import { Toaster } from '../toaster'

export class Game extends Component {
  static propTypes = {
    theme: PropTypes.string.isRequired
  }

  static childContextTypes = {
    socket: PropTypes.object
  }

  constructor(props) {
    super(props)

    this.socket = io.connect('/game', { forceNew: true })
  }

  getChildContext() {
    return { socket: this.socket }
  }

  componentWillMount() {
    let {
      route,
      router,
      params,
      currentPlayer,
      fetchGameInfo
    } = this.props

    fetchGameInfo(params.gameID)

    // TODO: Automatically join the game if there's a cookie
    if (!currentPlayer && route.path != '/:gameID/join') {
      router.push(`/${params.gameID}/join`)
    }
  }

  componentDidUpdate() {
    let { currentPlayer } = this.props

    if (currentPlayer && !this._socketHasEvents) {
      this.socket.on('game:error', this.triggerError)
      this.socket.on('game:notice', this.triggerNotice)
      this.socket.on('poll:new', this.triggerPoll)

      this._socketHasEvents = true
    }
  }

  triggerNotice = (message) => {
    let { toaster } = this.refs
    let options = {}

    if (message.indexOf('You ') !== 0) {
      options.secondaryButton = 'Veto'
      options.onSecondaryButtonPress = () => console.log('veto')
    }

    toaster.showToast(message, options)
  }

  triggerError = (message) => {
    let { toaster } = this.refs
    toaster.showToast(message, { isError: true })
  }

  triggerPoll = (pollID, message) => {
    let socket = this.socket
    let { toaster } = this.refs

    toaster.showToast(message, {
      timeout: 0,
      primaryButton: 'Yes',
      onPrimaryButtonPress(dismiss) {
        socket.emit('poll:vote', pollID, true)
        dismiss()
      },
      secondaryButton: 'No',
      onSecondaryButtonPress(dismiss) {
        socket.emit('poll:vote', pollID, false)
        dismiss()
      }
    })
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <ThemeIcons theme={this.props.theme}/>
        <Toaster ref="toaster"/>

        {this.props.children}
      </View>
    )
  }
}
