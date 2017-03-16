import React from 'react'

import PropertyInfoOwned from './PropertyInfoOwned'
import PropertyInfoPlayer from './PropertyInfoPlayer'
import PropertyInfoBank from './PropertyInfoBank'

const PropertyInfo = ({
  currentPlayer,
  improveProperty,
  unimproveProperty,
  mortgageProperty,
  unmortgageProperty,
  offerTrade,
  payRent,
  auctionProperty,
  buyProperty,
  ...props
}) => (
  (props.owner === currentPlayer ? (
    <PropertyInfoOwned
        onImproveProperty={improveProperty}
        onUnimproveProperty={unimproveProperty}
        onMortgageProperty={mortgageProperty}
        onUnmortgageProperty={unmortgageProperty}
        {...props}
    />
  ) : props.owner ? (
    <PropertyInfoPlayer
        onOfferTrade={() => console.log('@TODO: show trade modal')}
        onPayRent={payRent}
        {...props}
    />
  ) : (
    <PropertyInfoBank
        onAuctionProperty={() => console.log('@TODO: auction property')}
        onBuyProperty={buyProperty}
        {...props}
    />
  ))
)

export default PropertyInfo
