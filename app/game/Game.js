import React, { Component, PropTypes } from 'react'
import { Match, Miss, Redirect } from 'react-router'
import io from 'socket.io-client'

import { View, ThemeIcons } from '../core/components'
import { Container } from '../layout'
import { Toaster } from '../toaster'
import { GameNav } from './components'

import JoinGame from './JoinGameContainer'
import Player from '../player/PlayerContainer'
import Bank from '../bank/BankContainer'

class Game extends Component {
  static childContextTypes = {
    socket: PropTypes.object
  }

  getChildContext() {
    return { socket: this.socket }
  }

  componentWillMount() {
    this.props.fetchGameInfo(this.props.params.gameID)
    this._connectSocket()
  }

  shouldComponentUpdate(props) {
    return this.props.currentPlayer !== props.currentPlayer
  }

  componentDidUpdate() {
    const { currentPlayer } = this.props

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
    this.socket && this.socket.disconnect()
    this.socket = io.connect('/game', { forceNew: true })
  }

  triggerNotice = (message) => {
    const { toaster } = this.refs
    const options = {}

    if (message.indexOf('You ') !== 0) {
      options.secondaryButton = 'Veto'
      options.onSecondaryButtonPress = () => console.log('veto')
    }

    toaster.showToast(message, options)
  }

  triggerError = (message) => {
    const { toaster } = this.refs
    toaster.showToast(message, { isError: true })
  }

  triggerPoll = (pollID, message) => {
    const socket = this.socket
    const { toaster } = this.refs

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

  renderRoutes() {
    const { pattern, currentPlayer, players } = this.props

    if (currentPlayer) {
      return (
        <View style={{ flex: 1 }}>
          <GameNav/>

          <Match exactly pattern={pattern} render={(props) => (
              <Player {...props} player={currentPlayer}/>
            )}/>

          {players.map((p) => (
             <Match
                 key={p._id}
                 pattern={`${pattern}/${p.token}`}
                 render={(props) => (<Player {...props} player={p}/>)}
             />
           ))}

          <Match exactly pattern={`${pattern}/bank`} component={Bank}/>
        </View>
      )
    }

    return (
      <Match exactly pattern={pattern} component={JoinGame}/>
    )
  }

  renderRedirect = () => {
    const { params: { gameID } } = this.props

    return (
      <Redirect to={`/${gameID}`}/>
    )
  }

  render() {
    return (
      <Container>
        <ThemeIcons/>
        <Toaster ref="toaster"/>

        {this.renderRoutes()}

        <Miss render={this.renderRedirect}/>
      </Container>
    )
  }
}

export default Game
