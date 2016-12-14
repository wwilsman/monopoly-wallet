import React, { Component, PropTypes } from 'react'
import { View } from 'react-native'
import { Match, Miss, Redirect } from 'react-router'
import io from 'socket.io-client'

import JoinGame from './JoinGameContainer'
import Player from '../player/PlayerContainer'

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
    let { params, fetchGameInfo } = this.props
    fetchGameInfo(params.gameID)
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
    let {
      theme,
      player,
      params,
      pattern,
      children
    } = this.props

    return (
      <View style={{ flex: 1 }}>
        {this.props.theme && (
          <ThemeIcons theme={this.props.theme}/>
        )}

        <Match
          exactly
          pattern={pattern}
          component={player ? Player : JoinGame}
        />

        <Miss render={() => (
          <Redirect to={`/${params.gameID}`}/>
        )}/>

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
