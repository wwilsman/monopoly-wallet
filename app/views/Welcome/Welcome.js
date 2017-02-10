import React, { Component, PropTypes } from 'react'
import styles from './Welcome.css'

import { Flex, Box, Title } from '../../layout'
import { Button } from '../../common'
import { Toaster } from '../../toaster'

class Welcome extends Component {
  static contextTypes = {
    router: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired
  }

  static propTypes = {
    clearGameInfo: PropTypes.func.isRequired
  }

  state = {
    showJoinModal: false
  }

  componentWillMount() {
    if (this.props.gameID) {
      this.props.clearGameInfo()
    }
  }

  componentWillReceiveProps({ gameID }) {
    if (gameID) {
      this.context.router.push(`/${gameID}`)
    }
  }

  _showJoinModal = () => {
    this.setState({
      showJoinModal: true
    })
  }

  _hideJoinModal = () => {
    this.setState({
      showJoinModal: false
    })
  }

  _getGameInfo = (gameID) => {
    this.props.fetchGameInfo(gameID, false)
  }

  _goToNewGame = () => {
    this.context.router.push('/new');
  }

  render() {
    const { showJoinModal } = this.state

    return (
      <Flex>
        <Box className={styles.top} stretch justify="center">
          <Title lg>Monopoly<br/>Wallet</Title>
        </Box>

        <Box align="center" size="1/2"
             className={styles.buttons}>
          <Button
              onClick={this._showJoinModal}
              color="blue"
              width="1/2">
            Join Game
          </Button>

          <Button
              onClick={this._goToNewGame}
              color="green"
              width="1/2">
            New Game
          </Button>
        </Box>

        {showJoinModal && (
           <div>
             <Toaster/>
           </div>
         )}
      </Flex>
    )
  }
}

export default Welcome
