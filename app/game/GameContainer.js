import { connect } from 'react-redux'

import Game from './Game'
import { fetchGameInfo, updateGame } from './actions'

function mapStateToProps(state) {
  return {
    player: state.game.players.find((p) => p._id === state.player),
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
