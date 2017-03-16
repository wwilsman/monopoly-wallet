import React from 'react'
import styles from './PropertyInfo.css'

import { Flex, Text, PlayerLabel } from '../../layout'
import { Button, Currency } from '../../common'

const PropertyInfoAuction = ({
  property,
  bids,
  winning,
  children
}) => (
  <Flex>
    <Flex row align="center" className={styles.top}>
      {winning ? (
         <PlayerLabel token={winning.token} name={winning.name}/>
       ) : (
         <PlayerLabel token="bank"/>
       )}

      <Flex className={styles['top-right']}>
        <Currency amount={bids ? bids[0].amount : 0} className={styles.bid}/>
      </Flex>
    </Flex>

    {children}

    <Flex row justify="center" className={[styles.bottom, styles.close].join(' ')}>
      <Text sm center>
        <Text inherit>Price</Text>
        <Currency amount={property.price} className={styles.price}/>
      </Text>
    </Flex>
  </Flex>
)

export default PropertyInfoAuction
