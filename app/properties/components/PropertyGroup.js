import React from 'react'

import { View } from '../../core/components'
import PropertyCard from './PropertyCard'

const PropertyGroup = ({ properties, width, simple }) => (
  <View style={{ width }}>
    {properties.map((property, i) => (
       <PropertyCard
           key={property._id}
           style={!!i ? { position: 'absolute', top: width * 0.3 * i } : null}
           {...{ width, simple, property }}
       />
     ))}
  </View>
)

export default PropertyGroup
