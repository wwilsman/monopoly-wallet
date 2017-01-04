import { connect } from 'react-redux'

import PropertyCard from './PropertyCard'

function mapStateToProps(state, props) {
  return {
    color: state.theme.colors[props.property.group]
  }
}

const PropertyCardContainer = connect(
  mapStateToProps
)(PropertyCard)

export default PropertyCardContainer
