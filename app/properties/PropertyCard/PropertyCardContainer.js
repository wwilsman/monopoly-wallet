import { connect } from 'react-redux'

import PropertyCard from './PropertyCard'

const PropertyCardContainer = connect(
  (state, props) => ({
    theme: state.theme._id,
    color: state.theme.colors[props.property.group],
    mortgage: state.game.mortgageRate * props.property.price
  })
)(PropertyCard)

export default PropertyCardContainer
