import { connect } from 'react-redux'

import Player from './Player'
import { getCurrentPlayer } from './selectors'

function mapStateToProps(state) {
  return {
    player: getCurrentPlayer(state)
  }
}

const PlayerContainer = connect(
  mapStateToProps
)(Player)

export default PlayerContainer
