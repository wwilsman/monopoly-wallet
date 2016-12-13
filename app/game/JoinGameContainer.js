import { connect } from 'react-redux'

import JoinGame from './JoinGame'

import { getUsedTokens } from './selectors'
import { getCurrentPlayer } from '../player/selectors'

import { updateGame } from './actions'
import { setCurrentPlayer } from '../player/actions'

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
