import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';

import { getCurrentPlayer } from '../selectors/player';

import { Container, Section } from '../ui/layout';
import Toaster from '../ui/toaster';

@connect((state) => ({
  player: getCurrentPlayer(state)
}), {
  replace
})

class GameRoomScreen extends Component {
  static propTypes = {
    player: PropTypes.object,
    replace: PropTypes.func.isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        room: PropTypes.string.isRequired
      }).isRequired
    }).isRequired
  };

  componentWillMount() {
    const {
      player,
      match: { params },
      replace
    } = this.props;

    if (!player) {
      replace(`/${params.room}/join`);
    }
  }

  render() {
    return (
      <Container data-test-game-room>
        <Section/>
        <Toaster/>
      </Container>
    );
  }
}

export default GameRoomScreen;
