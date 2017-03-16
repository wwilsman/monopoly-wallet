import React from 'react'
import styles from './PropertyGrid.css'

import { Flex } from '../../layout'
import PropertyCard from '../PropertyCard'

function groupProperties(properties) {
  return Object.values(properties.reduce((hash, property) => {
    hash[property.group] = hash[property.group] || []
    hash[property.group].push(property)
    return hash
  }, {}))
}

const PropertyGrid = ({ properties, onClickGroup }) => (
  <Flex row className={styles.root}>
    {groupProperties(properties).map((group) => (
       <Flex
           key={group[0].group}
           className={styles.group}
           onClick={() => onClickGroup(group)}>
         {group.map((property) => (
            <PropertyCard
                key={property.name}
                property={property}
                simple
            />
          ))}
       </Flex>
     ), [])}
  </Flex>
)

export default PropertyGrid
