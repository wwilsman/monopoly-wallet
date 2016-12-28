import { connect } from 'react-redux'

import Game from './Game'
import { getCurrentPlayer } from '../player/selectors'
import { fetchGameInfo } from './actions'

function mapStateToProps(state) {
  return {
    currentPlayer: getCurrentPlayer(state),
    players: state.game.players
  }
}

const GameContainer = connect(
  mapStateToProps, {
    fetchGameInfo
  }
)(Game)

export default GameContainer
