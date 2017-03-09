import { connect } from 'react-redux'
import { createGetProperty } from '../../selectors/game'
import { getCurrentPlayer } from '../../selectors/player'
import { concedeAuction } from '../../actions/game'

import Auction from './Auction'

const AuctionContainer = connect(
  (props) => {
    const getProperty = createGetProperty()

    return (state) => ({
      bids: state.game.auction.bids,
      property: getProperty(state, state.game.auction.property),
      player: getCurrentPlayer(state)
    })
  }, {
    concedeAuction
  }
)(Auction)

export default AuctionContainer
