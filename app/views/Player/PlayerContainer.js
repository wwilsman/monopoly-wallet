import { connect } from 'react-redux'
import { payBank, collectMoney } from '../../actions/game'
import { getCurrentPlayer, createGetProperties } from '../../selectors/player'
import { createGetProperty } from '../../selectors/game'

import Player from './Player'

const PlayerContainer = connect(
  () => {
    const getProperties = createGetProperties()
    const getProperty = createGetProperty()

    return (state) => {
      const { notice } = state.game
      const property = notice.meta && notice.meta.property
      const wonAuction = property && notice.type === 'auction:end' &&
                         notice.blame.includes(state.player)

      return {
        player: getCurrentPlayer(state),
        properties: getProperties(state, state.player),
        showProperty: wonAuction && getProperty(state, property)
      }
    }
  }, {
    payBank,
    collectMoney
  }
)(Player)

export default PlayerContainer
