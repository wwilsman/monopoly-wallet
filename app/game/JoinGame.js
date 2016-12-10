import React, { Component, PropTypes } from 'react'

import {
  Container,
  Header,
  Title,
  Content,
  Centered,
  Footer
} from '../layout'

import {
  Button,
  Label,
  TextField
} from '../core/components'

import {
  TokenSelect
} from './components'

export class JoinGame extends Component {
  static propTypes = {
    tokens: PropTypes.array.isRequired,
    players: PropTypes.array.isRequired
  }

  static contextTypes = {
    socket: PropTypes.object
  }

  constructor(props) {
    super(props)

    this.state = {
      playerName: '',
      selectedToken: '',
      isWaiting: false,
      error: null
    }
  }

  componentWillMount() {
    let { router, params, player } = this.props

    if (player) {
      router.push(`/${params.gameID}/`)
    }
  }

  render() {
    return this.state.isWaiting ?
      this._renderWaiting() :
      this._renderJoin()
  }

  _renderWaiting() {
    let { error } = this.state
    let containerStyle = !error ? null :
      { backgroundColor: 'rgb(225,50,50)' }

    return (
      <Container style={containerStyle}>
        <Centered>
          <Title>{error || 'Waiting to join'}</Title>
        </Centered>
      </Container>
    )
  }

  _renderJoin() {
    let { tokens, usedTokens, players } = this.props
    let { playerName, selectedToken } = this.state

    let active = players.filter((p) => p.isActive)
    let player = players.find((p) => p.name === playerName && !p.isActive)

    if (player) {
      usedTokens = usedTokens.filter((t) => t !== player.token)
    }

    return (
      <Container>
        <Header>Join Game</Header>

        <Content>
          <Label>Your Name:</Label>

          <TextField
            onChangeText={this.setPlayerName}
            value={playerName}
          />

          <Label>Select A Token:</Label>

          <TokenSelect
            tokens={tokens}
            selectedToken={selectedToken}
            usedTokens={usedTokens}
            onChange={this.selectToken}
          />
        </Content>

        <Footer>
          <Button
              disabled={!(playerName && selectedToken)}
              onPress={this.startJoinGame}>
            {active.length ? 'Ask to join' : 'Join Game'}
          </Button>
        </Footer>
      </Container>
    )
  }

  setPlayerName = (name) => {
    this.setState({ playerName: name })
  }

  selectToken = (token) => {
    this.setState({ selectedToken: token })
  }

  startJoinGame = () => {
    let { socket } = this.context
    let { gameID } = this.props.params
    let { playerName, selectedToken } = this.state

    let playerData = {
      name: playerName,
      token: selectedToken
    }

    socket.once('game:error', this.showError)
    socket.once('game:joined', this.joinGame)

    socket.emit('game:join', gameID, playerData)
    this.setState({ isWaiting: true })
  }

  joinGame = (pid, gameState) => {
    let {
      router,
      params,
      updateGame,
      setCurrentPlayer
    } = this.props

    updateGame(gameState)
    setCurrentPlayer(pid)

    this._removeSocketEvents()
    router.push(`/${params.gameID}/`)
  }

  showError = (message) => {
    this._removeSocketEvents()
    this.setState({ error: message })
  }

  _removeSocketEvents() {
    let { socket } = this.context

    socket.off('game:error', this.showError)
    socket.off('game:joined', this.joinGame)
  }
}
