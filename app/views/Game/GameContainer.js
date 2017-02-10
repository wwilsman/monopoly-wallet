import { connect } from 'react-redux'
import { fetchGameInfo } from '../../actions/game'
import { getCurrentPlayer } from '../../selectors/player'

import Game from './Game'

const GameContainer = connect(
  (state) => ({
    hasInfo: !!state.game._id,
    currentPlayer: getCurrentPlayer(state),
    hasError: !!state.error
  }), {
    fetchGameInfo
  }
)(Game)

export default GameContainer
