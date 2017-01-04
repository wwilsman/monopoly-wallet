import React, { Component, PropTypes } from 'react'

import {
  View,
  Text,
  Container,
  Header,
  Footer,
  Content,
  Button,
  TextField,
  StatusScreen
} from '../../common'

import { TokenSelect } from '../../game'

class JoinGame extends Component {
  static contextTypes = {
    socket: PropTypes.object
  }

  state = {
    playerName: '',
    selectedToken: '',
    isWaiting: false,
    error: null
  }

  _removeSocketEvents() {
    const { socket } = this.context

    socket.off('game:error', this.showError)
    socket.off('game:joined', this.joinGame)
  }

  setPlayerName = (name) => {
    this.setState({ playerName: name })
  }

  selectToken = (token) => {
    this.setState({ selectedToken: token })
  }

  showError = (message) => {
    this._removeSocketEvents()
    this.setState({ error: message })
  }

  startJoinGame = () => {
    const { socket } = this.context
    const { params: { gameID } } = this.props

    const playerData = {
      name: this.state.playerName,
      token: this.state.selectedToken
    }

    socket.once('game:error', this.showError)
    socket.once('game:joined', this.joinGame)

    socket.emit('game:join', gameID, playerData)
    this.setState({ isWaiting: true })
  }

  joinGame = (pid, gameState) => {
    this.props.updateGame(gameState)
    this.props.setCurrentPlayer(pid)
    this._removeSocketEvents()
  }

  render() {
    const { tokens, usedTokens, players } = this.props
    const { playerName, selectedToken, error, isWaiting } = this.state

    const active = players.filter((p) => p.isActive)
    const player = players.find((p) => p.name === playerName && !p.isActive)
    const activeTokens = player ? usedTokens.filter((t) => t !== player.token) : usedTokens

    return isWaiting ? (
      <StatusScreen
          status={error ? 'Error' : 'Waiting...'}
          message={error || 'for your friends to accept'}
          error={!!error}
      />
    ) : (
      <Container>
        <Header>
          {!players.length ? 'New Game' : 'Join Game'}
        </Header>

        <Content>
          <TextField
            label="Your Name"
            onChangeText={this.setPlayerName}
            value={playerName}
          />

          <TokenSelect
            tokens={tokens}
            selected={selectedToken}
            usedTokens={activeTokens}
            onChange={this.selectToken}
          />
        </Content>

        <Footer>
          <Button
              disabled={!(playerName && selectedToken)}
              onPress={this.startJoinGame}>
            {active.length ? 'Ask to Join' : 'Join Game'}
          </Button>
        </Footer>
      </Container>
    )
  }
}

export default JoinGame
