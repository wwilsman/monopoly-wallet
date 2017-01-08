import { connect } from 'react-redux'

import Icon from './Icon'

function mapStateToIconProps(state) {
  return {
    theme: state.theme._id,
    glyphs: state.theme.glyphs
  }
}

const IconContainer = connect(
  mapStateToIconProps
)(Icon)

export default IconContainer
