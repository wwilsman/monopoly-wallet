import { connect } from 'react-redux'
import { removeToast, clearTimedToasts } from '../../actions/toasts'
import { voteInPoll } from '../../actions/game'

import Toaster from './Toaster'

const ToasterContainer = connect(
  (state) => ({
    toasts: state.toasts,
    players: state.game.players,
    currentPlayer: state.player
  }), {
    removeToast,
    clearTimedToasts,
    voteInPoll
  }
)(Toaster)

export default ToasterContainer
