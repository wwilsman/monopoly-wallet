import React from 'react'

import Property from './PropertyCardDefault'
import RailRoad from './PropertyCardRailRoad'
import Utility from './PropertyCardUtility'

const PropertyCard = ({ property, color, mortgage, simple, theme }) => (
  (property.group === 'railroad' ? (
    <RailRoad {...property} {...{ mortgage, simple }}
              iconPath={`/themes/${theme}/icons.svg#railroad`}/>
  ) : property.group === 'utility' ? (
    <Utility {...property} {...{ mortgage, simple }}
             iconPath={`/themes/${theme}/icons.svg#${property._id}`}/>
  ) : (
    <Property {...property} {...{ color, mortgage, simple }}/>
  ))
)

export default PropertyCard
