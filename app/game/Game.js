import React, { Component, PropTypes } from 'react'
import { View } from 'react-native'
import io from 'socket.io-client'

import { ThemeIcons } from '../core/components'

export class Game extends Component {
  static propTypes = {
    theme: PropTypes.string.isRequired
  }

  static childContextTypes = {
    socket: PropTypes.object,
    currentPlayer: PropTypes.object
  }

  constructor(props) {
    super(props)

    let socket = io.connect('/game')

    socket.on('game:joined', this.joinGame.bind(this))

    this.state = {
      currentPlayer: null,
      socket
    }
  }

  getChildContext() {
    let { socket, currentPlayer } = this.state

    return { socket, currentPlayer }
  }

  componentWillMount() {
    let { route, router, params, fetchGameInfo } = this.props

    fetchGameInfo(this.props.params.gameID)

    // TODO: Automatically join the game if there's a cookie
    if (!this.state.currentPlayer && route.path != '/:gameID/join') {
      router.push(`/${params.gameID}/join`)
    }
  }

  joinGame(pid, gameState) {
    let { router, params, updateGame } = this.props

    let currentPlayer = gameState.players.find((p) => p._id === pid)

    updateGame(gameState)
    this.setState({ currentPlayer })
    router.push(`/${params.gameID}/`)
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <ThemeIcons theme={this.props.theme}/>
        {this.props.children}
      </View>
    )
  }
}