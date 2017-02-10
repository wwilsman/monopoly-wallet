import { connect } from 'react-redux'
import { removeToast, clearTimedToasts } from '../../actions/toasts'

import Toaster from './Toaster'

const ToasterContainer = connect(
  (state) => ({
    toasts: state.toasts
  }),
  (dispatch) => ({
    dispatch,
    removeToast: (toastID) => {
      dispatch(removeToast(toastID))
    },
    clearTimedToasts: () => {
      dispatch(clearTimedToasts())
    }
  })
)(Toaster)

export default ToasterContainer
