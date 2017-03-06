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
    loading: PropTypes.string
  }

  state = {
    playerName: '',
    selectedToken: '',
    tokens: this.getTokenObjects(),
    loading: false
  }

  componentWillReceiveProps({ tokens, players, loading }) {
    if (tokens !== this.props.tokens || 
        players !== this.props.players) {
      this.setState({
        tokens: this.getTokenObjects(tokens, players)
      })
    }

    if (loading) {
      this._loadingTimeout = setTimeout(() => {
        this.setState({ loading: true })
      }, 100)
    } else {
      this._cancelLoading()
    }
  }

  componentWillUnmount() {
    this._cancelLoading()
  }

  _cancelLoading() {
    if (this._loadingTimeout) {
      clearTimeout(this._loadingTimeout)
    }

    this.setState({ loading: false })
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
    players = this.props.players
  ) {
    const { active } = this.props

    return tokens.map((token) => {
      const player = players.find((p) => p.token === token)

      return {
        name: token,
        player: player ? player.name : false,
        isActive: player ? active.includes(token) : false,
        disabled: !!player
      }
    })
  }

  render() {
    const {
      tokens,
      playerName,
      selectedToken,
      loading
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
              loading={loading}
              color="blue">
            Join Game
          </Button>
        </Box>
      </Flex>
    )
  }
}

export default JoinGame
