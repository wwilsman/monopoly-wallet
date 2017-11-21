import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Container, Section } from '../ui/layout';
import Input from '../ui/forms/input';
import Button from '../ui/button';

class FindGameModal extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    error: PropTypes.string,
    onSubmit: PropTypes.func.isRequired
  };

  state = {
    room: ''
  };

  changeRoom = (room) => {
    this.setState({ room: room.toUpperCase() });
  };

  handleSubmit = (e) => {
    let { room } = this.state;
    let { onSubmit } = this.props;

    e.preventDefault();

    if (room) {
      onSubmit(room);
    }
  };

  render() {
    const { loading, error } = this.props;
    const { room } = this.state;

    return (
      <Container
          tagName="form"
          onSubmit={this.handleSubmit}>
        <Section collapse>
          <Input
              label="room code"
              value={room}
              length={5}
              error={error}
              disabled={loading}
              onChangeText={this.changeRoom}
              onEnter={this.handleSubmit}
              data-test-find-game-input/>
        </Section>
        <Section flex="none">
          <Button
              block
              type="primary"
              loading={loading}
              disabled={room.length !== 5}
              onClick={this.findGame}
              data-test-find-game-btn>
            Find Room
          </Button>
        </Section>
      </Container>
    );
  }
}

export default FindGameModal;
