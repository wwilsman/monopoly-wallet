import React, { Component, PropTypes } from 'react'
import { Match, Miss, Redirect } from 'react-router'
import fetch from 'isomorphic-fetch'
import io from 'socket.io-client'

import { View, Container, StatusScreen } from '../../common'
import { PlayerNav, ThemeIcons } from '../../game'
import { Toaster } from '../../toaster'

import JoinGame from '../JoinGame'
import Player from '../Player'
import Bank from '../Bank'

class Game extends Component {
  static childContextTypes = {
    socket: PropTypes.object
  }

  state = {
    error: ''
  }

  getChildContext() {
    return { socket: this.socket }
  }

  componentWillMount() {
    const { updateGame, updateTheme, params } = this.props

    fetch(`/api/info?game=${params.gameID}`)
      .then((response) => response.json())
      .then(({ error, ...info }) => {
        if (error) {
          this.setState({ error: info.message })
        } else {
          updateGame(info.game)
          updateTheme(info.theme)
        }
      })

    this._connectSocket()
  }

  shouldComponentUpdate(props, state) {
    return this.props.currentPlayer !== props.currentPlayer ||
           this.state.error !== state.error
  }

  componentDidUpdate() {
    const { currentPlayer, updateGame } = this.props

    if (currentPlayer && !this._socketHasEvents) {
      this.socket.on('game:update', updateGame)
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

  render() {
    const {
      currentPlayer,
      pattern,
      params
    } = this.props

    const { error } = this.state

    const root = `/${params.gameID}`

    return error ? (
      <StatusScreen
          status="Error"
          message={error}
          error
      />
    ) : (
      <Container>
        <ThemeIcons/>
        <Toaster ref="toaster"/>

        {currentPlayer ? (
          <Container>
            <PlayerNav root={root} player={currentPlayer}/>

            <Match pattern={pattern} exactly component={Player}/>
            <Match pattern={`${pattern}/bank`} exactly component={Bank}/>
          </Container>
        ) : (
          <Match pattern={pattern} exactly component={JoinGame}/>
        )}

        <Miss render={() => (<Redirect to={root}/>)}/>
      </Container>
    )
  }
}

export default Game
