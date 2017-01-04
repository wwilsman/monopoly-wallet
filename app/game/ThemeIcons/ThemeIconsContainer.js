import { connect } from 'react-redux'

import ThemeIcons from './ThemeIcons'

function mapStateToProps(state) {
  return {
    theme: state.theme._id
  }
}

const ThemeIconsContainer = connect(
  mapStateToProps
)(ThemeIcons)

export default ThemeIconsContainer
