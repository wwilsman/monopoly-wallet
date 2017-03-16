import React from 'react'
import styles from './PropertyInfo.css'

import { Flex, Text, PlayerLabel } from '../../layout'
import { Button, Icon } from '../../common'

const PropertyInfoOwned = ({
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
  <Flex>
    <Flex row align="center" className={styles.top}>
      <PlayerLabel token={owner.token} name="owned"/>

      <Flex row className={styles['top-right']}>
        {property.buildings >= 5 ? (
           <Icon themed name="house" className={styles.hotel}/>
         ) : Array.from(' '.repeat(property.buildings)).map((s, i) => (
           <Icon key={i} themed name="house"/>
         ))}
      </Flex>
    </Flex>

    {children}

    <Flex className={styles.bottom}>
      {(isMonopoly && !property.isMortgaged &&
        property.group !== 'railroad' &&
        property.group !== 'utility') && (
          <Flex row className={styles.buttons}>
            <Button
                onClick={() => onUnimproveProperty(property.name)}
                disabled={!property.buildings}
                width="1/2"
                color="blue"
                small>
              Unimprove
            </Button>

            <Button
                onClick={() => onImproveProperty(property.name)}
                disabled={property.buildings === 5}
                width="1/2"
                color="green"
                small>
              Improve
            </Button>
          </Flex>
        )}

      <Flex className={styles.buttons}>
        {property.isMortgaged ? (
           <Button
               onClick={() => onUnmortgageProperty(property.name)}
               width="full"
               color="green"
               small>
             Unmortgage
           </Button>
         ) : (
           <Button
               onClick={() => onMortgageProperty(property.name)}
               width="full"
               color="dark"
               small>
             Mortgage
           </Button>
         )}
      </Flex>
    </Flex>
  </Flex>
)

export default PropertyInfoOwned
