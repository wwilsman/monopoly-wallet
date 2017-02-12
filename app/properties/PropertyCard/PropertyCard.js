import React from 'react'

import Property from './PropertyCardDefault'
import RailRoad from './PropertyCardRailRoad'
import Utility from './PropertyCardUtility'

const PropertyCard = ({ property, theme, ...props }) => (
  (property.group === 'railroad' ? (
    <RailRoad {...property} {...props}
        iconPath={`/themes/${theme}/icons.svg#railroad`}/>
  ) : property.group === 'utility' ? (
    <Utility {...property} {...props}
        iconPath={`/themes/${theme}/icons.svg#${property._id}`}/>
  ) : (
    <Property {...property} {...props}/>
  ))
)

export default PropertyCard
