import { connect } from 'react-redux'

import { JoinGame } from './JoinGame'
import { updateGame, setCurrentPlayer } from './GameActions'

function mapStateToProps({
  game: { players = [] },
  theme: { tokens = [] },
  player
}) {
  return {
    player: players.find((p) => p._id === player),
    usedTokens: players.map((p) => p.token),
    players,
    tokens,
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
