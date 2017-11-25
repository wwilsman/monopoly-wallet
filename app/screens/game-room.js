import React, { Component } from 'react';
import PropTypes from 'prop-types';
import route from './route';

import { connectToGame, joinGame } from '../redux/game';

import { Container, Section } from '../ui/layout';
import { NavLeft, NavRight } from '../ui/nav';
import Text from '../ui/typography/text';
import Toaster from '../ui/toaster';
import Spinner from '../ui/spinner';

@route(({ app, game }) => ({
  room: app.room,
  player: app.player,
  connected: !!game
}), {
  connectToGame,
  joinGame
})

class GameRoomScreen extends Component {
  static propTypes = {
    room: PropTypes.string,
    player: PropTypes.object,
    connected: PropTypes.bool.isRequired,
    connectToGame: PropTypes.func.isRequired,
    joinGame: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    params: PropTypes.shape({
      room: PropTypes.string.isRequired
    }).isRequired
  };

  componentWillMount() {
    let {
      room,
      player,
      connected,
      connectToGame,
      params,
      replace
    } = this.props;

    if (!player || room !== params.room) {
      replace(`/${params.room}/join`);
    } else if (room && !connected) {
      connectToGame(room);
    }
  }

  componentWillReceiveProps(nextProps) {
    let {
      player,
      connected,
      joinGame
    } = nextProps;

    // if we are connected, but weren't before,
    // we should also join the game
    if (connected && !this.props.connected) {
      joinGame(player);
    }
  }

  render() {
    let { connected, params } = this.props;

    return (
      <Container data-test-game-room>
        {!connected ? (
          <Section align="center" justify="center">
            <Spinner xl/>
          </Section>
        ) : [
          <Section key={0} flex="none" row>
            <NavLeft/>

            <NavRight>
              {!!params.room && (
                <Text sm upper color="secondary" data-test-room-code>
                  {params.room}
                </Text>
              )}
            </NavRight>
          </Section>,

          <Toaster key={1}/>
        ]}
      </Container>
    );
  }
}

export default GameRoomScreen;
