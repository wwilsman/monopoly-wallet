import { connect } from 'react-redux'

import Errored from './Errored'

const ErroredContainer = connect(
  (state) => ({
    name: state.error.name,
    message: state.error.message
  })
)(Errored)

export default ErroredContainer
