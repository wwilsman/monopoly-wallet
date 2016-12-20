import { connect } from 'react-redux'

import Game from './Game'
import { getCurrentPlayer } from '../player/selectors'
import { fetchGameInfo, updateGame } from './actions'

function mapStateToProps(state) {
  return {
    currentPlayer: getCurrentPlayer(state),
    players: state.game.players,
    theme: state.theme._id
  }
}

const GameContainer = connect(
  mapStateToProps, {
    fetchGameInfo,
    updateGame
  }
)(Game)

export default GameContainer
