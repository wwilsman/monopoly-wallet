import { connect } from 'react-redux'

import { JoinGame } from './JoinGame'
import { updateGame, setCurrentPlayer } from './GameActions'

function mapStateToProps({
  game: { players = [], isClosed },
  theme: { tokens = [] },
  currentPlayer
}) {
  return {
    tokens,
    players,
    currentPlayer,
    gameClosed: isClosed
  }
}

function mapDispatchToProps(dispatch) {
  return {
    updateGame(state) {
      dispatch(updateGame(state))
    },

    setCurrentPlayer(data) {
      dispatch(setCurrentPlayer(data))
    }
  }
}

export const JoinGameContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(JoinGame)
