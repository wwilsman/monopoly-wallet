import { connect } from 'react-redux'
import { payBank, collectMoney } from '../../actions/game'
import { getCurrentPlayer, createGetProperties } from '../../selectors/player'

import Player from './Player'

const PlayerContainer = connect(
  () => {
    const getProperties = createGetProperties()

    return (state) => ({
      player: getCurrentPlayer(state),
      properties: getProperties(state, state.player)
    })
  }, {
    payBank,
    collectMoney
  }
)(Player)

export default PlayerContainer
