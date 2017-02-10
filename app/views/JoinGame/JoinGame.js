import React, { Component, PropTypes } from 'react'
import styles from './JoinGame.css'

import { Flex, Box, Title, Label } from '../../layout'
import { Button, TextInput } from '../../common'
import { TokenSelect } from '../../game'

class JoinGame extends Component {
  static propTypes = {
    tokens: PropTypes.array.isRequired,
    players: PropTypes.array.isRequired,
    joinGame: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.shape({
      match: PropTypes.shape({
        params: PropTypes.shape({
          gameID: PropTypes.string.isRequired
        }).isRequired
      }).isRequired
    }).isRequired
  }

  state = {
    playerName: '',
    selectedToken: '',
    tokens: this.getTokenObjects(),
    isWaiting: false
  }

  componentWillReceiveProps({ tokens, players }) {
    if (tokens !== this.props.tokens ||
        players !== this.props.players) {
      this.setState({
        tokens: this.getTokenObjects(tokens, players)
      })
    }
  }

  _handleNameChange = (name) => {
    const playerName = name.toUpperCase()
    const { selectedToken } = this.state
    let state = { playerName }

    state.tokens = this.getTokenObjects().map((token, i) => (
      (token.player === playerName && !token.isActive) ?
        { ...token, disabled: false } : token
    ))

    if (selectedToken && selectedToken.player &&
        selectedToken.player !== playerName) {
      state.selectedToken = null
    }

    this.setState(state)
  }

  _handleTokenChange = (selectedToken) => {
    this.setState({ selectedToken })
  }

  _handleAskToJoin = () => {
    const { joinGame } = this.props
    const { match: { params } } = this.context.router

    const playerData = {
      name: this.state.playerName,
      token: this.state.selectedToken.name
    }

    joinGame(params.gameID, playerData)
    this.setState({ isWaiting: true })
  }

  getTokenObjects(
    tokens = this.props.tokens,
    players = this.props.players
  ) {
    return tokens.map((token) => {
      const player = players.find((p) => p.token === token)

      return {
        name: token,
        player: player ? player.name : false,
        isActive: player ? player.isActive : false,
        disabled: !!player
      }
    })
  }

  render() {
    const {
      tokens,
      playerName,
      selectedToken,
      isWaiting
    } = this.state

    return (
      <Flex>
        <Box size="1/8">
          <Title>Join Game</Title>
        </Box>

        <Box stretch>
          <Label>Your Name</Label>

          <TextInput
              className={styles['name-input']}
              onChangeText={this._handleNameChange}
              placeholder="clevername"
              value={playerName}
          />

          <TokenSelect
              tokens={tokens}
              selected={selectedToken}
              onChange={this._handleTokenChange}
          />
        </Box>

        <Box>
          <Button
              onClick={this._handleAskToJoin}
              disabled={isWaiting || !playerName || !selectedToken}
              color="blue">
            Join Game
          </Button>
        </Box>
      </Flex>
    )
  }
}

export default JoinGame
