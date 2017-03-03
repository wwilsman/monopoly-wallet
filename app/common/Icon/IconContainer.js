import { connect } from 'react-redux'

import Icon from './Icon'

const IconContainer = connect(
  (state) => ({
    theme: state.theme.theme
  })
)(Icon)

export default IconContainer
