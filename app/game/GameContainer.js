import { connect } from 'react-redux'

import { fetchGameInfo, updateGame } from './GameActions'
import { Game } from './Game'

function mapStateToProps({
  theme: { _id: theme = '' },
  currentPlayer
}) {
  return { theme, currentPlayer }
}

function mapDispatchToProps(dispatch) {
  return {
    fetchGameInfo(gameID) {
      dispatch(fetchGameInfo(gameID))
    },

    updateGame(state) {
      dispatch(updateGame(state))
    }
  }
}

export const GameContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Game)
