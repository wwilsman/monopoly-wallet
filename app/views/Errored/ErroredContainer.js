import { connect } from 'react-redux'

import Errored from './Errored'

const ErroredContainer = connect(
  (state) => ({
    title: state.error.title,
    message: state.error.message
  })
)(Errored)

export default ErroredContainer
