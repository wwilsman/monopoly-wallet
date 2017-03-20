import { connect } from 'react-redux'
import { isWaitingForAuction } from '../../selectors/loading'
import { getCurrentPlayer } from '../../selectors/player'
import { connectGame } from '../../actions/game'

import Game from './Game'

const GameContainer = connect(
  (state) => ({
    room: state.game.room,
    currentPlayer: getCurrentPlayer(state),
    isWaitingForAuction: isWaitingForAuction(state),
    hasAuction: !!state.game.auction,
    hasError: !!state.error
  }), {
    connectGame
  }
)(Game)

export default GameContainer
