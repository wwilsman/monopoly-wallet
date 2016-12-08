import { connect } from 'react-redux'

import { InProgressGame } from './InProgressGame'
import { updateGame, setCurrentPlayer } from './GameActions'

function mapStateToProps({
  game: { players = [], isClosed },
  theme: { tokens = [] },
  currentPlayer
}) {
  return {
    players,
    currentPlayer,
    gameClosed: isClosed
  }
}

export const InProgressGameContainer = connect(
  mapStateToProps
)(InProgressGame)
