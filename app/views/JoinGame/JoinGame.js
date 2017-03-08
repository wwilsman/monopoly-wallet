import React, { Component, PropTypes } from 'react'
import styles from './JoinGame.css'

import { Flex, Box, Title, Label } from '../../layout'
import { Button, TextInput } from '../../common'
import { TokenSelect } from '../../game'

class JoinGame extends Component {
  static propTypes = {
    tokens: PropTypes.array.isRequired,
    active: PropTypes.array.isRequired,
    players: PropTypes.array.isRequired,
    joinGame: PropTypes.func.isRequired,
    isWaiting: PropTypes.bool
  }

  state = {
    playerName: '',
    selectedToken: '',
    tokens: this.getTokenObjects(),
    isWaiting: false
  }

  componentWillReceiveProps(props) {
    const { selectedToken } = this.state

    const {
      active:oldActive,
      tokens:oldTokens,
      players:oldPlayers
    } = this.props

    const {
      active,
      tokens,
      players,
      isWaiting
    } = props

    if (active !== oldActive || tokens !== oldTokens || players !== oldPlayers) {
      const isTokenTaken = selectedToken && active.includes(selectedToken.name)

      this.setState({
        tokens: this.getTokenObjects(tokens, players, active),
        selectedToken: !isTokenTaken ? selectedToken : null
      })
    }

    if (isWaiting) {
      this._clearWaiting()
      this._waitingTimeout = setTimeout(() => {
        this.setState({ isWaiting })
      }, 100)
    } else {
      this._clearWaiting(true)
    }
  }

  componentWillUnmount() {
    this._clearWaiting()
  }

  _clearWaiting(setState) {
    if (this._waitingTimeout) {
      clearTimeout(this._waitingTimeout)
    }

    if (setState) {
      this.setState({
        isWaiting: false
      })
    }
  }

  _handleNameChange = (name) => {
    const playerName = name.toLowerCase()
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
    const { playerName, selectedToken } = this.state
    this.props.joinGame(playerName, selectedToken.name)
  }

  getTokenObjects(
    tokens = this.props.tokens,
    players = this.props.players,
    active = this.props.active
  ) {
    const playerName = this.state && this.state.playerName

    return tokens.map((token) => {
      const player = players.find((p) => p.token === token)
      const isActive = player ? active.includes(token) : false

      return {
        name: token,
        player: player ? player.name : false,
        disabled: !!player && (player.name !== playerName || isActive),
        isActive
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
              disabled={!playerName || !selectedToken}
              loading={isWaiting}
              color="blue">
            Join Game
          </Button>
        </Box>
      </Flex>
    )
  }
}

export default JoinGame
