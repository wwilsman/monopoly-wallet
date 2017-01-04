import React from 'react'
import s from './PropertyGroup.scss'

import { View } from '../../common'
import PropertyCard from '../PropertyCard'

const PropertyGroup = ({ properties, simple }) => (
  <View className={s.root}>
    {properties.map((property, i) => (
       <PropertyCard
           key={property._id}
           className={s.property}
           property={property}
           simple={simple}
       />
     ))}
  </View>
)

export default PropertyGroup
