import React, { Component } from 'react'
import s from './PropertyCard.scss'

import { formatCurrency } from '../../utils'

import { View, Text, Icon } from '../../common'

const PropertyCard = ({
  className,
  property,
  color,
  simple,
}) => (
  <View className={[s.root, className]}>
    <View className={[s.card, (simple && s.simple)]}>
      {simple ? (
        <View className={s.header} style={{ backgroundColor: color }}/>
      ) : (
        <View className={s.wrapper}>
          <View className={s.header} style={{ backgroundColor: color }}>
            <Text className={s.headerText}>
              {property.name}
            </Text>
          </View>

          <View className={s.content}>
            {property.rent.map((r, i) => i === 0 ? (
              <Text className={s.rent} key={i}>
                Rent <Icon name="currency"/>{formatCurrency(r)}
              </Text>
            ) : i === 5 ? (
              <Text className={s.hotelRent} key={i}>
                With Hotel <Icon name="currency"/>{formatCurrency(r)}
              </Text>
            ) : (
              <View className={s.houseRent} key={i}>
                <Text>With {i} House{i > 1 && 's'}</Text>
                <Text><Icon name="currency"/>{formatCurrency(r)}</Text>
              </View>
            ))}

            <View className={s.info}>
              <Text>
                Mortgage Value <Icon name="currency"/>{formatCurrency(property.price * 0.5)}
              </Text>
            </View>

            <View className={s.info}>
              <Text>
                Houses cost <Icon name="currency"/>{formatCurrency(property.cost)} each
              </Text>
            </View>

            <View className={s.info}>
              <Text>
                Hotels cost <Icon name="currency"/>{formatCurrency(property.cost)} plus 4 houses
              </Text>
            </View>

            <View className={s.finePrint}>
              <Text>
                If a player owns ALL of the properties of any color group
                the rent is doubled on unimproved properties in that group
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  </View>
)

export default PropertyCard
