import React, { Component, PropTypes } from 'react'
import { View } from 'react-native'
import io from 'socket.io-client'

import { ThemeIcons } from '../core/components'
import { Toaster } from '../toaster'

export default class Game extends Component {
  static childContextTypes = {
    socket: PropTypes.object
  }

  constructor(props) {
    super(props)
    this._connectSocket()
  }

  getChildContext() {
    return { socket: this.socket }
  }

  componentWillMount() {
    let {
      route,
      router,
      params,
      player,
      fetchGameInfo
    } = this.props

    fetchGameInfo(params.gameID)

    // TODO: Automatically join the game if there's a cookie
    if (!player && route.path != '/:gameID/join') {
      router.push(`/${params.gameID}/join`)
    }
  }

  componentDidUpdate() {
    let { player } = this.props

    if (player && !this._socketHasEvents) {
      this.socket.on('game:error', this.triggerError)
      this.socket.on('game:notice', this.triggerNotice)
      this.socket.on('poll:new', this.triggerPoll)

      this._socketHasEvents = true

    } else if (!player && this._socketHasEvents) {
      this._socketHasEvents = false
      this._connectSocket()
    }
  }

  render() {
    let { theme } = this.props
    return (
      <View style={{ flex: 1 }}>
        {theme && <ThemeIcons theme={theme}/>}

        {this.props.children}

        <Toaster ref="toaster"/>
      </View>
    )
  }

  _connectSocket() {
    if (this.socket) {
      this.socket.disconnect()
    }

    this.socket = io.connect('/game', { forceNew: true })
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
}
