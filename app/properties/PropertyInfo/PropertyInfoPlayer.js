import React from 'react'
import styles from './PropertyInfo.css'

import { Flex, Text, PlayerLabel } from '../../layout'
import { Button, Icon } from '../../common'

const PropertyInfoPlayer = ({
  property,
  owner,
  onOfferTrade,
  onPayRent,
  isMonopoly,
  children,
  ...props
}) => (
  <Flex>
    <Flex row align="center" className={styles.top}>
      <PlayerLabel token={owner.token} name={owner.name}/>

      <Flex row className={styles['top-right']}>
        {property.buildings >= 5 ? (
           <Icon themed name="house" className={styles.hotel}/>
         ) : Array.from(' '.repeat(property.buildings)).map((s, i) => (
           <Icon key={i} themed name="house"/>
         ))}
      </Flex>
    </Flex>

    {children}

    <Flex row className={styles.bottom}>
      <Button
          onClick={() => onOfferTrade(property.name)}
          width="1/2"
          color="green"
          small>
        Offer Trade
      </Button>

      <Button
          onClick={() => onPayRent(property.name)}
          disabled={property.isMortgaged}
          width="1/2"
          color="red"
          small>
        Pay Rent
      </Button>
    </Flex>
  </Flex>
)

export default PropertyInfoPlayer
