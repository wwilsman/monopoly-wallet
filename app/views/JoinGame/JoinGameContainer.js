import { connect } from 'react-redux'
import { joinGame } from '../../actions/game'

import JoinGame from './JoinGame'

const JoinGameContainer = connect(
  (state) => ({
    tokens: state.theme.playerTokens,
    players: state.game.players,
    active: state.game.active
  }), {
    joinGame
  }
)(JoinGame)

export default JoinGameContainer
