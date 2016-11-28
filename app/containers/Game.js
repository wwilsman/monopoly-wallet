import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { View } from 'react-native'
import io from 'socket.io-client'

import { fetchGameInfo } from '../actions'
import { ThemeIcons } from '../containers'

class Game extends Component {
  static propTypes = {
    theme: PropTypes.string.isRequired
  }

  static childContextTypes = {
    socket: PropTypes.object
  }

  constructor(props) {
    super(props)

    let socket = io.connect('/game')

    // TODO: Handle a few websocket events

    this.state = {
      isPlaying: false,
      socket
    }
  }

  getChildContext() {
    let { socket } = this.state
    return { socket }
  }

  componentWillMount() {
    let { route, router, params, fetchGameInfo } = this.props

    fetchGameInfo(this.props.params.gameID)

    // TODO: Automatically join the game if there's a cookie
    if (!this.state.isPlaying && route.path != '/:gameID/join') {
      router.push(`/${params.gameID}/join`)
    }
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

function mapStateToProps(state) {
  let { theme = '' } = state.game
  return { theme }
}

function mapDispatchToProps(dispatch) {
  return {
    fetchGameInfo(gameID) {
      dispatch(fetchGameInfo(gameID))
    }
  }
}

Game = connect(mapStateToProps, mapDispatchToProps)(Game)

export { Game }
