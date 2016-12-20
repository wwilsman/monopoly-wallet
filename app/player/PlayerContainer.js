import { connect } from 'react-redux'

import Player from './Player'
import { getCurrentPlayer, getPlayerProperties } from './selectors'

function mapStateToProps(state) {
  return {
    player: getCurrentPlayer(state),
    properties: getPlayerProperties(state)
  }
}

const PlayerContainer = connect(
  mapStateToProps
)(Player)

export default PlayerContainer
