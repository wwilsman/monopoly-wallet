import { connect } from 'react-redux'

import { JoinGame } from './JoinGame'

function mapStateToProps({
  game: { players = [] },
  theme: { tokens = [] }
}) {
  return {
    usedTokens: players.map((p) => p.token),
    tokens
  }
}

export const JoinGameContainer = connect(
  mapStateToProps
)(JoinGame)
