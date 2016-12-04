import React, { Component, PropTypes } from 'react'

import {
  Container,
  Header,
  Content,
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
    usedTokens: PropTypes.array.isRequired
  }

  static contextTypes = {
    socket: PropTypes.object,
    currentPlayer: PropTypes.object
  }

  constructor(props) {
    super(props)

    this.setPlayerName = this.setPlayerName.bind(this)
    this.selectToken = this.selectToken.bind(this)
    this.joinGame = this.joinGame.bind(this)

    this.state = {
      playerName: '',
      selectedToken: ''
    }
  }

  componentWillMount() {
    let { router, params } = this.props

    if (this.context.currentPlayer) {
      router.push(`/${params.gameID}/`)
    }
  }

  setPlayerName(name) {
    this.setState({ playerName: name })
  }

  selectToken(token) {
    this.setState({ selectedToken: token })
  }

  joinGame() {
    let { socket } = this.context
    let { gameID } = this.props.params
    let { playerName, selectedToken } = this.state

    let playerData = {
      name: playerName,
      token: selectedToken
    }

    socket.emit('game:join', gameID, playerData)
  }

  render() {
    let { theme, tokens, usedTokens } = this.props
    let { playerName, selectedToken } = this.state

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
              onPress={this.joinGame}>
            {usedTokens.length ? 'Ask to join' : 'Join Game'}
          </Button>
        </Footer>
      </Container>
    )
  }
}
