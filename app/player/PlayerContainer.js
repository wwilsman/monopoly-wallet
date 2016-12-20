import { connect } from 'react-redux'

import Player from './Player'
import { getCurrentPlayer, makeGetPlayerProperties } from './selectors'

function mapStateToProps() {
  const getPlayerProperties = makeGetPlayerProperties()

  return (state, props) => ({
    currentPlayer: getCurrentPlayer(state),
    properties: getPlayerProperties(state, props)
  })
}

const PlayerContainer = connect(
  mapStateToProps
)(Player)

export default PlayerContainer
