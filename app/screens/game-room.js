import React, { Component } from 'react';
import PropTypes from 'prop-types';
import route from './route';

import { Container, Section } from '../ui/layout';
import Toaster from '../ui/toaster';

@route(({ app, game }) => ({
  player: app.player && game.state.players[app.player]
}))

class GameRoomScreen extends Component {
  static propTypes = {
    player: PropTypes.object,
    replace: PropTypes.func.isRequired,
    params: PropTypes.shape({
      room: PropTypes.string.isRequired
    }).isRequired
  };

  componentWillMount() {
    const {
      player,
      params,
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
