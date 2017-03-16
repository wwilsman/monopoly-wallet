import React from 'react'
import styles from './PropertyInfo.css'

import { Flex, Text, PlayerLabel } from '../../layout'
import { Button, Currency } from '../../common'

const PropertyInfoBank = ({
  property,
  owner,
  onAuctionProperty,
  onBuyProperty,
  isMonopoly,
  className,
  children
}) => (
  <Flex>
    <Flex row align="center" className={styles.top}>
      <PlayerLabel token="bank" name="unowned"/>

      <Flex className={styles['top-right']}>
        <Currency amount={property.price}/>
      </Flex>
    </Flex>

    {children}

    <Flex row className={styles.bottom}>
      <Button
          onClick={() => onAuctionProperty(property.name)}
          width="1/2"
          color="blue"
          small>
        Auction
      </Button>

      <Button
          onClick={() => onBuyProperty(property.name)}
          width="1/2"
          color="green"
          small>
        Purchase
      </Button>
    </Flex>
  </Flex>
)

export default PropertyInfoBank
