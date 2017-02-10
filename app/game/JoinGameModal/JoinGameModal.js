import React, { Component, PropTypes } from 'react'
import styles from './JoinGameModal.css'

import { Flex, Label } from '../../layout'
import { TextInput, Button, Modal } from '../../common'

class JoinGameModal extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    onContinue: PropTypes.func.isRequired
  }

  state = {
    gameID: ''
  }

  componentDidMount() {
    this.input.focus()
  }

  _setGameID = (gameID) => {
    this.setState({
      gameID: gameID.substr(0, 5).toUpperCase()
    })
  }

  _joinGame = () => {
    this.props.onContinue(this.state.gameID)
  }

  render() {
    const { onClose } = this.props
    const { gameID } = this.state

    return (
      <Modal onClose={onClose}>
        <Flex className={styles.input}>
          <Label>Room Code</Label>

          <TextInput
              ref={(ref) => this.input = ref}
              onChangeText={this._setGameID}
              placeholder="Enter Code"
              value={gameID}
          />
        </Flex>

        <Flex direction="row" justify="space-between">
          <Button
              color="blue"
              width="full"
              disabled={!gameID.match(/[^\/]{5}/)}
              onClick={this._joinGame}>
            Continue
          </Button>
        </Flex>
      </Modal>
    )
  }
}

export default JoinGameModal
