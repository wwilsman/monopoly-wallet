import React from 'react'

import PropertyControlsOwned from './PropertyControlsOwned'
import PropertyControlsPlayer from './PropertyControlsPlayer'
import PropertyControlsBank from './PropertyControlsBank'

const PropertyControls = ({
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
    <PropertyControlsOwned
        onImproveProperty={improveProperty}
        onUnimproveProperty={unimproveProperty}
        onMortgageProperty={mortgageProperty}
        onUnmortgageProperty={unmortgageProperty}
        {...props}
    />
  ) : props.owner ? (
    <PropertyControlsPlayer
        onOfferTrade={() => console.log('@TODO: show trade modal')}
        onPayRent={payRent}
        {...props}
    />
  ) : (
    <PropertyControlsBank
        onAuctionProperty={() => console.log('@TODO: auction property')}
        onBuyProperty={buyProperty}
        {...props}
    />
  ))
)

export default PropertyControls
