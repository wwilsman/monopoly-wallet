import { connect } from 'react-redux'

import Player from './Player'
import { getCurrentPlayer, makeGetPlayerProperties } from '../../core/selectors'

function mapStateToProps() {
  const getPlayerProperties = makeGetPlayerProperties()

  return (state, props) => ({
    player: getCurrentPlayer(state),
    properties: getPlayerProperties(state, state.player)
  })
}

const PlayerContainer = connect(
  mapStateToProps
)(Player)

export default PlayerContainer
