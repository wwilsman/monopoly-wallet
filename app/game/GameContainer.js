import { connect } from 'react-redux'

import Game from './Game'
import { getCurrentPlayer } from '../player/selectors'
import { fetchGameInfo, updateGame } from './actions'

function mapStateToProps(state) {
  return {
    player: getCurrentPlayer(state),
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
