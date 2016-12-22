import React, { Component, PropTypes } from 'react'
import { View } from 'react-native'
import { Match, Miss, Redirect } from 'react-router'
import io from 'socket.io-client'

import JoinGame from './JoinGameContainer'
import Player from '../player/PlayerContainer'
import Bank from '../bank/BankContainer'

import { ThemeIcons } from '../core/components'
import { GameNav } from './components'
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
    let { currentPlayer } = this.props

    if (currentPlayer && !this._socketHasEvents) {
      this.socket.on('game:error', this.triggerError)
      this.socket.on('game:notice', this.triggerNotice)
      this.socket.on('poll:new', this.triggerPoll)

      this._socketHasEvents = true

    } else if (!currentPlayer && this._socketHasEvents) {
      this._socketHasEvents = false
      this._connectSocket()
    }
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

  render() {
    let {
      theme,
      currentPlayer,
      players,
      params,
      pattern,
      location
    } = this.props

    return (
      <View style={{ flex: 1 }}>
        {theme && (<ThemeIcons theme={theme}/>)}

        {currentPlayer ? (
          <View style={{ flex: 1 }}>
            <GameNav location={location}/>

            <Match exactly pattern={pattern} render={(props) => (
              <Player {...props} player={currentPlayer}/>
            )}/>

            {players.map((p) => (
              <Match key={p._id}
                pattern={`${pattern}/${p.token}`}
                render={(props) => (<Player {...props} player={p}/>)}
              />
            ))}

            <Match exactly pattern={`${pattern}/bank`} component={Bank}/>
          </View>
        ) : (
          <Match exactly pattern={pattern} component={JoinGame}/>
        )}

        <Miss render={() => (<Redirect to={`/${params.gameID}`}/>)}/>
        <Toaster ref="toaster"/>
      </View>
    )
  }
}
