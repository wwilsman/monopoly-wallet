import { connect } from 'react-redux'
import { joinGame } from '../../actions/game'

import JoinGame from './JoinGame'

const JoinGameContainer = connect(
  (state) => ({
    tokens: state.theme.playerTokens,
    players: state.game.players,
    active: state.game.active,
    loading: state.loading || null
  }), {
    joinGame
  }
)(JoinGame)

export default JoinGameContainer
