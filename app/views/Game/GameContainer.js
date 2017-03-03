import { connect } from 'react-redux'
import { connectGame } from '../../actions/game'
import { getCurrentPlayer } from '../../selectors/player'

import Game from './Game'

const GameContainer = connect(
  (state) => ({
    room: state.game.room,
    currentPlayer: getCurrentPlayer(state),
    hasError: !!state.error
  }), {
    connectGame
  }
)(Game)

export default GameContainer
