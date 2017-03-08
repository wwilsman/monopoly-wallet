import { connect } from 'react-redux'
import { isWaitingToJoin } from '../../selectors/loading'
import { joinGame } from '../../actions/game'

import JoinGame from './JoinGame'

const JoinGameContainer = connect(
  (state) => ({
    tokens: state.theme.playerTokens,
    players: state.game.players,
    active: state.game.active,
    isWaiting: isWaitingToJoin(state)
  }), {
    joinGame
  }
)(JoinGame)

export default JoinGameContainer
