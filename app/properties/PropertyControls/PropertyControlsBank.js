import React from 'react'
import styles from './PropertyControls.css'

import { Text } from '../../layout'
import { Button, Icon, Currency } from '../../common'

const PropertyControlsBank = ({
  property,
  owner,
  onAuctionProperty,
  onBuyProperty,
  isMonopoly,
  className,
  children,
  ...props
}) => (
  <div className={[styles.root, className].join(' ')} {...props}>
    <div className={styles.top}>
      <Icon themed name="bank" className={styles.icon}/>
      <Text sm upcase>unowned</Text>

      <div className={styles['top-right']}>
        <Currency amount={property.price}/>
      </div>
    </div>

    {children}

    <div className={styles.bottom}>
      <Button small width="1/2" color="blue"
              onClick={() => onAuctionProperty(property.name)}>
        Auction
      </Button>

      <Button small width="1/2" color="green"
              onClick={() => onBuyProperty(property.name)}>
        Purchase
      </Button>
    </div>
  </div>
)

export default PropertyControlsBank
