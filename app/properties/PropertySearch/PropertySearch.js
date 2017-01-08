import React, { Component, PropTypes } from 'react'
import s from './PropertySearch.scss'

import { View, Text } from '../../common'
import PropertyCard from '../PropertyCard'

const PropertySearch = ({ properties, query, onPress }) => {
  const queryReg = new RegExp(`^(${query}).*`, 'i')
  const foundIndex = properties.findIndex((p) => queryReg.test(p.name))
  const visibleProperties = properties.slice(foundIndex, foundIndex + 5)
  const found = properties[foundIndex]

  return (
    <View className={s.root} onClick={() => found && onPress(found)}>
      {found ? visibleProperties.map((property) => (
        <View key={property._id} className={s.property}>
          <PropertyCard className={s.card} property={property}/>
        </View>
      )) : (
        <View className={s.notFound}>
          <Text className={s.title}>Not Found</Text>
          <Text className={s.note}>Maybe another player already owns it</Text>
        </View>
      )}
    </View>
  )
}

export default PropertySearch
