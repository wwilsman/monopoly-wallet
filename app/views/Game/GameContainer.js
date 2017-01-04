import { connect } from 'react-redux'

import Game from './Game'
import { getCurrentPlayer } from '../../core/selectors'
import { updateGame, updateTheme } from '../../core/actions'

function mapStateToProps(state) {
  return {
    currentPlayer: getCurrentPlayer(state),
    players: state.game.players
  }
}

const GameContainer = connect(
  mapStateToProps, {
    updateGame,
    updateTheme
  }
)(Game)

export default GameContainer
