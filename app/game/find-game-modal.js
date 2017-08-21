import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Modal from '../ui/modal';
import Input from '../ui/forms/input';
import Button from '../ui/button';

class FindGameModal extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    error: PropTypes.string,
    onFindGame: PropTypes.func.isRequired
  };

  state = {
    room: ''
  };

  changeRoom = (room) => {
    this.setState({ room: room.toUpperCase() });
  };

  findGame = () => {
    this.props.onFindGame(this.state.room);
  };

  render() {
    const { loading, error } = this.props;
    const { room } = this.state;

    return (
      <Modal data-test-find-game-modal>
        <Input
            alt
            label="enter room"
            value={room}
            length={5}
            error={error}
            disabled={loading}
            onChangeText={this.changeRoom}
            onEnter={this.handleSubmit}
            data-test-find-game-input/>
        <Button
            block
            type="primary"
            loading={loading}
            disabled={loading || room.length !== 5}
            onClick={this.findGame}
            data-test-find-game-btn>
          Find Room
        </Button>
      </Modal>
    );
  }
}

export default FindGameModal;
