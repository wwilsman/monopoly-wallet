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
      console.log(notice)
      const property = notice && notice.meta.property
      const wonAuction = property && notice.meta.action === 'auction:end' &&
                         notice.meta.players.includes(state.player)

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
