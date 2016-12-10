import { connect } from 'react-redux'

import { fetchGameInfo, updateGame } from './GameActions'
import { Game } from './Game'

function mapStateToProps({
  theme: { _id: theme = '' },
  game: { players },
  player
}) {
  return {
    player: players.find((p) => p._id === player),
    theme
  }
}

export const GameContainer = connect(
  mapStateToProps, {
    fetchGameInfo,
    updateGame
  }
)(Game)
