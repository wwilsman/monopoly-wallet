import React, { Component, PropTypes } from 'react'
import styles from './Auction.css'

import {
  Flex,
  Box,
  Title,
  Label
} from '../../layout'

import {
  Icon,
  Button,
  Currency,
  CurrencyField,
  Stepper
} from '../../common'

import { PropertyCard } from '../../properties'

class Auction extends Component {
  static propTypes = {
    player: PropTypes.object.isRequired,
    concedeAuction: PropTypes.func.isRequired,
    placeAuctionBid: PropTypes.func.isRequired,
    property: PropTypes.object,
    bids: PropTypes.array
  }

  static contextTypes = {
    router: PropTypes.shape({
      push: PropTypes.func.isRequired,
      match: PropTypes.shape({
        params: PropTypes.shape({
          room: PropTypes.string.isRequired
        }).isRequired
      }).isRequired
    }).isRequired
  }

  state = {
    bid: 0
  }

  componentWillReceiveProps(props) {
    const { push, match } = this.context.router
    const { params: { room } } = match
    const { bids, player } = props

    const notInvited = !bids || !bids.find((b) =>
      b.player === player.token)

    if (notInvited) {
      push(`/${room}`)
    }
  }

  _handleConcede = () => {
    const { property, concedeAuction } = this.props
    concedeAuction(property.name)
  }

  _handleChangeBid = (bid) => {
    this.setState({ bid })
  }

  _handlePlaceBid = () => {
    const { property, placeAuctionBid } = this.props
    placeAuctionBid(property.name, this.state.bid)
  }

  render() {
    const { bid } = this.state

    const {
      bids,
      player,
      property,
      concedeAuction,
      placeAuctionBid
    } = this.props

    if (!bids) {
      return null
    }

    const winning = bids[0]

    return (
      <Flex>
        <Box size="1/8">
          <Title>Auction</Title>
        </Box>

        <Box stretch>
          <div className={styles.property}>
            <div className={styles.winning}>
              <Icon themed name={winning.amount > 0 ? winning.player : 'bank'}
                    className={styles['winning-icon']}/>

              <div className={styles['winning-bid']}>
                <Currency amount={winning.amount}
                          className={styles['winning-amount']}/>
                <Label close>Current Bid</Label>
              </div>
            </div>

            <PropertyCard property={property}/>
          </div>
        </Box>

        <Box>
          <Flex direction="row">
            <Button
                onClick={this._handleConcede}
                color="grey"
                width="1/2">
              Concede
            </Button>

            <Button
                onClick={this._handlePlaceBid}
                color="green"
                width="1/2">
              Bid
            </Button>
          </Flex>

          <Flex direction="row" className={styles.bidding}>
            <div className={styles['bidding-balance']}>
              <Label>Available</Label>

              <Currency
                  className={styles.balance}
                  amount={player.balance}
              />
            </div>

            <div className={styles['bidding-bid']}>
              <Stepper
                  input={bid}
                  onStep={this._handleChangeBid}>
                <CurrencyField
                    amount={bid}
                    onChange={this._handleChangeBid}
                />
              </Stepper>
            </div>
          </Flex>
        </Box>
      </Flex>
    )
  }
}

export default Auction
