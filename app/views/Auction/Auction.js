import React, { Component, PropTypes } from 'react'
import styles from './Auction.css'

import {
  Flex,
  Section,
  Header,
  Title,
  Text,
  Label
} from '../../layout'

import {
  Icon,
  Button,
  Currency,
  CurrencyField,
  Stepper
} from '../../common'

import {
  PropertyCard,
  PropertyInfo
} from '../../properties'

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

    const winning = bids[0] || { amount: 0 }
    const isWinning = winning.amount > 0 && winning.player === player.token
    const canBid = !isWinning && winning.amount < player.balance

    return (
      <Flex container>
        <Header>
          <Title>Auction</Title>
        </Header>

        <Section stretch>
          <Flex className={styles.property}>
            <PropertyInfo auction property={property}>
              <PropertyCard property={property}/>
            </PropertyInfo>
          </Flex>
        </Section>

        <Section>
          <Flex row align="end" className={styles.bidding}>
            <Flex className={styles['bidding-balance']}>
              <Label>Balance</Label>

              <Text>
                <Currency amount={player.balance} className={styles.balance}/>
              </Text>
            </Flex>

            <Flex className={styles['bidding-bid']}>
              <Stepper
                  input={bid}
                  max={player.balance}
                  min={winning.amount}
                  disabled={!canBid}
                  onStep={this._handleChangeBid}>
                <CurrencyField
                    amount={bid}
                    onChange={this._handleChangeBid}
                />
              </Stepper>
            </Flex>
          </Flex>

          <Flex row>
            <Button
                onClick={this._handleConcede}
                color="grey"
                width="1/2">
              Concede
            </Button>

            <Button
                onClick={this._handlePlaceBid}
                disabled={!canBid}
                color="green"
                width="1/2">
              Bid
            </Button>
          </Flex>
        </Section>
      </Flex>
    )
  }
}

export default Auction
