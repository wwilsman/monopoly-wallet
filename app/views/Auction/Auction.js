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
    property: PropTypes.object.isRequired,
    bids: PropTypes.array.isRequired,
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
    bid: this.props.bids[0].amount,
    usingInput: false
  }

  componentWillReceiveProps(props) {
    const { push, match } = this.context.router
    const { params: { room } } = match
    const { bids, player } = props

    if (!bids.find((b) => b.player === player.token)) {
      push(`/${room}`)
    }
  }

  _handleConcede = () => {
    const { property, concedeAuction } = this.props
    concedeAuction(property.name)
  }

  _handleStepBid = (bid) => {
    this.setState({
      usingInput: false,
      bid
    })
  }

  _handleChangeBid = (bid, e) => {
    if (e.which !== 8 && !this.state.usingInput) {
      bid = bid % 10
    }

    this.setState({
      usingInput: true,
      bid
    })
  }

  _handlePlaceBid = () => {
    const { property, placeAuctionBid } = this.props
    placeAuctionBid(property.name, this.state.bid)
  }

  render() {
    const {
      bid
    } = this.state

    const {
      bids,
      player,
      property,
      concedeAuction,
      placeAuctionBid
    } = this.props

    const isWinning = bids[0].amount > 0 && bids[0].player === player.token
    const canBid = !isWinning && bids[0].amount < player.balance

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
                  min={bids[0].amount}
                  disabled={!canBid}
                  onStep={this._handleStepBid}>
                <CurrencyField
                    amount={bid}
                    max={player.balance}
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
