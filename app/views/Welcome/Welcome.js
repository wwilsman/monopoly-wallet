import React, { Component, PropTypes } from 'react'
import styles from './Welcome.css'

import { Flex, Section, Title } from '../../layout'
import { Button } from '../../common'
import { JoinGameModal } from '../../game'
import { Toaster } from '../../toaster'

class Welcome extends Component {
  static contextTypes = {
    router: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired
  }

  static propTypes = {
    connectGame: PropTypes.func.isRequired,
    disconnectGame: PropTypes.func.isRequired,
    showErrorToast: PropTypes.func.isRequired,
    clearError: PropTypes.func.isRequired,
    isConnecting: PropTypes.bool,
    error: PropTypes.object,
    room: PropTypes.string
  }

  state = {
    showJoinModal: false,
    isConnecting: false
  }

  componentWillMount() {
    if (this.props.room) {
      this.props.disconnectGame()
    }
  }

  componentWillReceiveProps(props) {
    const { isConnecting, error, room } = props

    if (error) {
      this.props.showErrorToast(error.message)
    } else if (room) {
      this.context.router.push(`/${room}`)
    }

    if (isConnecting) {
      this.clearConnecting()
      this.connectingTimeout = setTimeout(() => {
        this.setState({ isConnecting })
      }, 100)
    } else {
      this.clearConnecting(true)
    }
  }

  componentWillUnmount() {
    this.clearConnecting()
  }

  clearConnecting(setState) {
    if (this.connectingTimeout) {
      clearTimeout(this.connectingTimeout)
    }

    if (setState) {
      this.setState({
        isConnecting: false
      })
    }
  }

  _handleShowJoinModal = () => {
    this.setState({
      showJoinModal: true
    })
  }

  _handleHideJoinModal = () => {
    this.setState({
      showJoinModal: false
    })
  }

  _handleConnect = (roomCode) => {
    this.props.clearError()
    this.props.connectGame(roomCode)
  }

  _handleNewGame = () => {
    this.context.router.push('/new');
  }

  render() {
    const {
      isConnecting,
      showJoinModal
    } = this.state

    return (
      <Flex container>
        <Section stretch justify="center" align="center">
          <Title lg className={styles.title}>
            Monopoly<br/>Wallet
          </Title>
        </Section>

        <Section
            size="1/2"
            align="center"
            className={styles.buttons}>
          <Button
              onClick={this._handleShowJoinModal}
              color="blue"
              width="1/2">
            Join Game
          </Button>

          <Button
              onClick={this._handleNewGame}
              color="green"
              width="1/2">
            New Game
          </Button>
        </Section>

        {showJoinModal && (
           <JoinGameModal
               onClose={this._handleHideJoinModal}
               onContinue={this._handleConnect}
               loading={isConnecting}
           />
         )}

        {showJoinModal && (
           <Toaster/>
         )}
      </Flex>
    )
  }
}

export default Welcome
