import React, { Component } from 'react';
import PropTypes from 'prop-types';
import route from './route';

import {
  connectToGame,
  disconnectGame,
  joinGame
} from '../redux/game';

import { Container, Section } from '../ui/layout';
import { NavLeft, NavRight } from '../ui/nav';
import { Heading, Text } from '../ui/typography';
import Spinner from '../ui/spinner';
import Button from '../ui/button';
import Icon from '../ui/icon';

import JoinGameForm from '../game/join-game-form';

@route(({ app, game, config }) => ({
  room: app.room,
  error: app.error,
  player: app.player,
  connected: !!game,
  tokens: config.playerTokens,
  joining: app.waiting.includes('game:joined'),
  connecting: app.waiting.includes('room:connected'),
  players: !game ? [] : game.players._all.map((token) => ({
    active: app.players.includes(token),
    ...game.players[token]
  }))
}), {
  connectToGame,
  disconnectGame,
  joinGame
})

class JoinGameScreen extends Component {
  static propTypes = {
    room: PropTypes.string,
    error: PropTypes.string,
    tokens: PropTypes.array,
    player: PropTypes.object,
    connected: PropTypes.bool.isRequired,
    joining: PropTypes.bool.isRequired,
    connecting: PropTypes.bool.isRequired,
    players: PropTypes.arrayOf(PropTypes.object),
    connectToGame: PropTypes.func.isRequired,
    disconnectGame: PropTypes.func.isRequired,
    joinGame: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    location: PropTypes.shape({
      state: PropTypes.object.isRequired
    }).isRequired,
    params: PropTypes.shape({
      room: PropTypes.string
    }).isRequired
  };

  componentWillMount() {
    let {
      room,
      player,
      connected,
      params,
      connectToGame,
      disconnectGame
    } = this.props;

    // different room, different game
    if (params.room !== room) {
      connectToGame(params.room);
    // make sure we always connect to a room
    } else if (!connected) {
      connectToGame(room);
    // if we are connected to a room, disconnect
    } else {
      disconnectGame();
    }
  }

  componentWillReceiveProps(nextProps) {
    let {
      room,
      error,
      player,
      connected,
      connecting,
      connectToGame,
      params,
      push,
      replace
    } = nextProps;

    // if we have a known player, send them to the game room
    if (room && player) {
      push(`/${room}`, { player });
    // if we aren't connected and have an error, send them to find a room
    } else if (!connected && error) {
      replace(`/join`);
    // if we aren't connected or connecting, connect
    } else if (!connected && !connecting) {
      connectToGame(params.room);
    }
  }

  render() {
    let {
      room,
      error,
      tokens,
      joining,
      connecting,
      players,
      joinGame,
      location,
      params,
      goBack
    } = this.props;

    return (
      <Container data-test-join-game>
        {connecting ? (
          <Section align="center" justify="center">
            <Spinner xl/>
          </Section>
        ) : [
          <Section key={0} flex="none" row>
            <NavLeft>
              {location.state.internal && (
                <Button type="icon" onClick={goBack} data-test-back>
                  <Icon name="larr"/>
                </Button>
              )}
            </NavLeft>

            <Heading data-test-join-game-heading>
              Join Game
            </Heading>

            <NavRight>
              <Text sm upper color="secondary" data-test-room-code>
                {params.room}
              </Text>
            </NavRight>
          </Section>,

          <JoinGameForm
              key={1}
              error={error}
              tokens={tokens}
              players={players}
              loading={joining}
              onSubmit={joinGame}/>
        ]}
      </Container>
    );
  }
}

export default JoinGameScreen;
