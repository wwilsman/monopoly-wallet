import { connect } from 'react-redux'

import JoinGame from './JoinGame'
import { updateGame } from './actions'
import { setCurrentPlayer } from '../player/actions'

function mapStateToProps(state) {
  return {
    player: state.game.players.find((p) => p._id === state.player),
    usedTokens: state.game.players.map((p) => p.token),
    players: state.game.players,
    tokens: state.theme.tokens
  }
}

const JoinGameContainer = connect(
  mapStateToProps, {
    updateGame,
    setCurrentPlayer
  }
)(JoinGame)

export default JoinGameContainer
