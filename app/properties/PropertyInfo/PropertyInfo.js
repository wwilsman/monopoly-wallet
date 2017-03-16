import React from 'react'

import PropertyInfoOwned from './PropertyInfoOwned'
import PropertyInfoPlayer from './PropertyInfoPlayer'
import PropertyInfoBank from './PropertyInfoBank'
import PropertyInfoAuction from './PropertyInfoAuction'

const PropertyInfo = ({
  auction,
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
  (auction ? (
    <PropertyInfoAuction {...props}/>
  ) : props.owner === currentPlayer ? (
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
        onAuctionProperty={auctionProperty}
        onBuyProperty={buyProperty}
        {...props}
    />
  ))
)

export default PropertyInfo
