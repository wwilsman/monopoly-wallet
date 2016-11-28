import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import {
  Button,
  Container,
  Header,
  Content,
  Footer,
  Label,
  TextField,
  TokenSelect,
} from '../components'

class JoinGame extends Component {
  static propTypes = {
    tokens: PropTypes.array.isRequired,
    usedTokens: PropTypes.array.isRequired
  }

  static contextTypes = {
    socket: PropTypes.object
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

    // TODO: Uncomment after handling the response higher up
    // socket.emit('game:join', gameID, playerData)
    console.log(playerData)
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

function mapStateToProps(state) {
  let {
    tokens = [],
    players = []
  } = state.game

  let usedTokens = players.map((p) => p.token)

  return { tokens, usedTokens }
}

JoinGame = connect(mapStateToProps)(JoinGame)

export { JoinGame }
