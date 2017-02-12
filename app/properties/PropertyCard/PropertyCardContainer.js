import { connect } from 'react-redux'

import PropertyCard from './PropertyCard'

const PropertyCardContainer = connect(
  (state, props) => {
    const mortgageValue = Math.round(state.game.mortgageRate * props.property.price)

    return {
      theme: state.theme._id,
      color: state.theme.colors[props.property.group],
      mortgageCost: Math.round(mortgageValue * state.game.interestRate) + mortgageValue,
      mortgageValue
    }
  }
)(PropertyCard)

export default PropertyCardContainer
