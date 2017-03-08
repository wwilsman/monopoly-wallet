import { connect } from 'react-redux'
import { isWaitingToConnect } from '../../selectors/loading'
import { connectGame, disconnectGame } from '../../actions/game'
import { showErrorToast } from '../../actions/toasts'
import { clearError } from '../../actions/error'

import Welcome from './Welcome'

const WelcomeContainer = connect(
  (state) => ({
    room: state.game.room,
    error: state.error || null,
    isConnecting: isWaitingToConnect(state)
  }), {
    showErrorToast,
    clearError,
    connectGame,
    disconnectGame
  }
)(Welcome)

export default WelcomeContainer
