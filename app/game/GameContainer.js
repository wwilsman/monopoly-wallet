import React from 'react'
import { connect } from 'react-redux'

import { fetchGameInfo, updateGame } from './GameActions'
import { Game } from './Game'

function mapStateToProps({
  theme: { _id: theme = '' }
}) {
  return { theme }
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
