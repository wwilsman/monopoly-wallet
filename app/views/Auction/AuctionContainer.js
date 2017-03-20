import { connect } from 'react-redux'
import { createGetProperty } from '../../selectors/game'
import { getCurrentPlayer } from '../../selectors/player'
import { concedeAuction, placeAuctionBid } from '../../actions/game'

import Auction from './Auction'

const AuctionContainer = connect(
  () => {
    const getProperty = createGetProperty()

    return (state) => ({
      bids: state.game.auction.bids,
      property: getProperty(state, state.game.auction.property),
      player: getCurrentPlayer(state)
    })
  }, {
    concedeAuction,
    placeAuctionBid
  }
)(Auction)

export default AuctionContainer
