import React, { Component, PropTypes } from 'react'
import styles from './Auction.css'

import { Flex, Box, Title } from '../../layout'
import { Button } from '../../common'
import { PropertyCard } from '../../properties'

class Auction extends Component {
  static propTypes = {
    bids: PropTypes.array.isRequired,
    property: PropTypes.object.isRequired,
    player: PropTypes.object.isRequired,
    concedeAuction: PropTypes.func.isRequired
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

  componentWillReceiveProps(props) {
    const { push, match } = this.context.router
    const { bids, player } = props

    if (!bids.find((b) => b.player === player.token)) {
      push(`/${match.params.room}`)
    }
  }

  render() {
    const {
      property,
      concedeAuction
    } = this.props

    return (
      <Flex>
        <Box size="1/8">
          <Title>Auction</Title>
        </Box>

        <Box stretch>
          <div className={styles.property}>
            <PropertyCard property={property}/>
          </div>
        </Box>

        <Box direction="row">
          <Button
              onClick={() => concedeAuction(property.name)}
              color="grey"
              width="1/2">
            Concede
          </Button>

          <Button
              color="green"
              width="1/2">
            Bid
          </Button>
        </Box>
      </Flex>
    )
  }
}

export default Auction
