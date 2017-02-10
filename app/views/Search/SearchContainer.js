import { connect } from 'react-redux'

import Search from './Search'

const SearchContainer = connect(
  (state) => ({
    properties: state.game.properties
  })
)(Search)

export default SearchContainer
