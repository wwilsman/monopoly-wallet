import { connect } from 'react-redux'

import PropertyCard from './PropertyCard'

const PropertyCardContainer = connect(
  (state, props) => ({
    theme: state.theme.theme,
    color: state.theme.groupColors[props.property.group]
  })
)(PropertyCard)

export default PropertyCardContainer
