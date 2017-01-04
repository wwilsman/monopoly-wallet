import { connect } from 'react-redux'

import JoinGame from './JoinGame'

import { getUsedTokens, getCurrentPlayer } from '../../core/selectors'
import { updateGame, setCurrentPlayer } from '../../core/actions'

function mapStateToProps(state) {
  return {
    player: getCurrentPlayer(state),
    usedTokens: getUsedTokens(state),
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
