import { connect } from 'react-redux'
import { createGetPlayer, getCurrentPlayer } from '../../selectors/player'
import { createIsPropertyMonopoly } from '../../selectors/game'

import {
  improveProperty,
  unimproveProperty,
  mortgageProperty,
  unmortgageProperty,
  offerTrade,
  payRent,
  auctionProperty,
  buyProperty
} from '../../actions/game'

import PropertyInfo from './PropertyInfo'

const PropertyInfoContainer = connect(
  () => {
    const getPlayer = createGetPlayer()
    const isPropertyMonopoly = createIsPropertyMonopoly()

    return (state, props) => ({
      currentPlayer: getCurrentPlayer(state),
      owner: getPlayer(state, props.property.owner),
      isMonopoly: isPropertyMonopoly(state, props.property)
    })
  }, {
    improveProperty,
    unimproveProperty,
    mortgageProperty,
    unmortgageProperty,
    offerTrade,
    payRent,
    auctionProperty,
    buyProperty
  }
)(PropertyInfo)

export default PropertyInfoContainer
