import React, { Component, PropTypes } from 'react'
import styles from './Auction.css'

import { Flex, Box, Title } from '../../layout'
import { Button } from '../../common'
import { PropertyCard } from '../../properties'

class Auction extends Component {
  static propTypes = {
    bids: PropTypes.array.isRequired,
    property: PropTypes.object.isRequired
  }

  render() {
    const { property } = this.props

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
              width="1/2"
              color="grey">
            Concede
          </Button>

          <Button
              width="1/2"
              color="green">
            Bid
          </Button>
        </Box>
      </Flex>
    )
  }
}

export default Auction
