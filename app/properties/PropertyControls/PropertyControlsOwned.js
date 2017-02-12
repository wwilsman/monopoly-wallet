import React from 'react'
import styles from './PropertyControls.css'

import { Text } from '../../layout'
import { Button, Icon } from '../../common'

const PropertyControlsOwned = ({
  property,
  owner,
  onImproveProperty,
  onUnimproveProperty,
  onMortgageProperty,
  onUnmortgageProperty,
  isMonopoly,
  children,
  ...props
}) => (
  <div {...props}>
    <div className={styles.top}>
      <Icon themed name={owner.token} className={styles.icon}/>
      <Text sm upcase>owned</Text>

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
      {(isMonopoly && !property.isMortgaged &&
        property.group !== 'railroad' &&
        property.group !== 'utility') && (
          <div className={styles.buttons}>
            <Button small width="1/2" color="blue"
                    disabled={!property.buildings}
                    onClick={() => onUnimproveProperty(property._id)}>
              Unimprove
            </Button>

            <Button small width="1/2" color="green"
                    disabled={property.buildings === 5}
                    onClick={() => onImproveProperty(property._id)}>
              Improve
            </Button>
          </div>
        )}

      <div className={styles.buttons}>
        {property.isMortgaged ? (
           <Button small width="full" color="green"
                   onClick={() => onUnmortgageProperty(property._id)}>
             Unmortgage
           </Button>
         ) : (
           <Button small width="full" color="dark"
                   onClick={() => onMortgageProperty(property._id)}>
             Mortgage
           </Button>
         )}
      </div>
    </div>
  </div>
)

export default PropertyControlsOwned
