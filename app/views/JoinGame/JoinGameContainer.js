import { connect } from 'react-redux'
import { joinGame } from '../../actions/game'

import JoinGame from './JoinGame'

const JoinGameContainer = connect(
  (state) => ({
    tokens: state.theme.tokens,
    players: state.game.players
  }), {
    joinGame
  }
)(JoinGame)

export default JoinGameContainer
