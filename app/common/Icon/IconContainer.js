import { connect } from 'react-redux'

import Icon from './Icon'

const IconContainer = connect(
  (state) => ({
    theme: state.theme._id
  })
)(Icon)

export default IconContainer
