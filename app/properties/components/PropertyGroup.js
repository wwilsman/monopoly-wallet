import React from 'react'
import { View } from 'react-native'

import PropertyCard from './PropertyCard'

const PropertyGroup = ({ properties, width, simple }) => (
  <View style={{ width }}>
    {properties.map((property, i) => (
      <PropertyCard key={property._id}
        style={i ? { marginTop: width * -1.2 } : null}
        {...{ width, simple, property }}
      />
    ))}
  </View>
)

export default PropertyGroup
