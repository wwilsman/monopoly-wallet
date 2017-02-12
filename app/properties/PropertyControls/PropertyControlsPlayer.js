import React from 'react'
import styles from './PropertyControls.css'

import { Text } from '../../layout'
import { Button, Icon } from '../../common'

const PropertyControlsPlayer = ({
  property,
  owner,
  onOfferTrade,
  onPayRent,
  className,
  children,
  ...props
}) => (
  <div className={[styles.root, className].join(' ')} {...props}>
    <div className={styles.top}>
      <Icon themed name={owner.token} className={styles.icon}/>
      <Text sm upcase>{owner.name}</Text>

      <div className={styles['top-right']}>
        {property.buildings >= 5 ? (
           <Icon themed name="house" className={styles.hotel}/>
         ) : Array.from(' '.repeat(property.buildings)).map((s, i) => (
           <Icon key={i} themed name="house"/>
         ))}
      </div>
    </div>

    {children}

    <div className={styles.bottom}>
      <Button small width="1/2" color="green"
              onClick={() => onOfferTrade(property._id)}>
        Offer Trade
      </Button>

      <Button small width="1/2" color="red"
              disabled={property.isMortgaged}
              onClick={() => onPayRent(property._id)}>
        Pay Rent
      </Button>
    </div>
  </div>
)

export default PropertyControlsPlayer
