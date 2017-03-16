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
      <Button small width="1/2" color="blue"
              onClick={() => onAuctionProperty(property.name)}>
        Auction
      </Button>

      <Button small width="1/2" color="green"
              onClick={() => onBuyProperty(property.name)}>
        Purchase
      </Button>
    </Flex>
  </Flex>
)

export default PropertyInfoBank
