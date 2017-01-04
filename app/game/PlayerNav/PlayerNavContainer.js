import { connect } from 'react-redux'

import PlayerNav from './PlayerNav'

function mapStateToProps(state) {
  return {
    location: state.routing.location
  }
}

const PlayerNavContainer = connect(
  mapStateToProps
)(PlayerNav)

export default PlayerNavContainer
