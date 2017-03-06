import { connect } from 'react-redux'
import { createGetProperty } from '../../selectors/game'

import Auction from './Auction'

const AuctionContainer = connect(
  (props) => {
    const getProperty = createGetProperty()

    return (state) => ({
      bids: state.game.auction.bids,
      property: getProperty(state, state.game.auction.property)
    })
  }
)(Auction)

export default AuctionContainer
