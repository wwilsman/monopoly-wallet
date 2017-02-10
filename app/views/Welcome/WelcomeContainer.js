import { connect } from 'react-redux'
import { fetchGameInfo, clearGameInfo } from '../../actions/game'

import Welcome from './Welcome'

const WelcomeContainer = connect(
  (state) => ({
    gameID: state.game._id
  }), {
    fetchGameInfo,
    clearGameInfo
  }
)(Welcome)

export default WelcomeContainer
