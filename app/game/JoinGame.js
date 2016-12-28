import React, { Component, PropTypes } from 'react'

import {
  Container,
  Header,
  Title,
  Content,
  Centered,
  Footer
} from '../layout'

import { Button, Label, TextField } from '../core/components'
import { TokenSelect } from './components'

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

  renderWaiting() {
    const { error } = this.state
    const containerStyle = !error ? null :
      { backgroundColor: 'rgb(225,50,50)' }

    return (
      <Container style={containerStyle}>
        <Centered>
          <Title>{error || 'Waiting to join'}</Title>
        </Centered>
      </Container>
    )
  }

  renderJoin() {
    let { tokens, usedTokens, players } = this.props
    const { playerName, selectedToken } = this.state

    const active = players.filter((p) => p.isActive)
    const player = players.find((p) => p.name === playerName && !p.isActive)

    if (player) {
      usedTokens = usedTokens.filter((t) => t !== player.token)
    }

    return (
      <Container>
        <Header>Join Game</Header>

        <Content>
          <Label>Your Name:</Label>

          <TextField
              onChange={(e) => this.setPlayerName(e.target.value)}
              value={playerName}
          />

          <Label>Select A Token:</Label>

          <TokenSelect
              tokens={tokens}
              selected={selectedToken}
              usedTokens={usedTokens}
              onChange={this.selectToken}
          />
        </Content>

        <Footer>
          <Button
              disabled={!(playerName && selectedToken)}
              onClick={this.startJoinGame}>
            {active.length ? 'Ask to join' : 'Join Game'}
          </Button>
        </Footer>
      </Container>
    )
  }

  render() {
    return this.state.isWaiting ?
           this.renderWaiting() :
           this.renderJoin()
  }
}

export default JoinGame
