import React, { Component, PropTypes } from 'react'
import styles from './JoinGameModal.css'

import { Flex, Label } from '../../layout'
import { Button, Modal, TextInput } from '../../common'

class JoinGameModal extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    onContinue: PropTypes.func.isRequired
  }

  state = {
    roomCode: ''
  }

  componentDidMount() {
    this.input.focus()
  }

  _handleChangeRoomCode = (roomCode) => {
    roomCode = roomCode.substr(0, 5).toUpperCase()
    this.setState({ roomCode })
  }

  _handleJoinGame = () => {
    this.props.onContinue(this.state.roomCode)
  }

  render() {
    const { loading, onClose } = this.props
    const { roomCode } = this.state

    return (
      <Modal onClose={onClose}>
        <Flex className={styles.input}>
          <Label>Room Code</Label>

          <TextInput
              ref={(input) => this.input = input}
              onChangeText={this._handleChangeRoomCode}
              placeholder="Enter Code"
              value={roomCode}
          />
        </Flex>

        <Flex direction="row">
          <Button
              onClick={this._handleJoinGame}
              disabled={!roomCode.match(/[^\/]{5}/)}
              loading={!!loading}
              color="blue"
              width="full">
            Continue
          </Button>
        </Flex>
      </Modal>
    )
  }
}

export default JoinGameModal
