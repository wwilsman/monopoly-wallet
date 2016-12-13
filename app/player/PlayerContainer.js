import { connect } from 'react-redux'

import Player from './Player'

function mapStateToProps(state) {
  return {
    player: state.game.players.find((p) => p._id === state.player)
  }
}

const PlayerContainer = connect(
  mapStateToProps
)(Player)

export default PlayerContainer
