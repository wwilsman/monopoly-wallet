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

import FindGameForm from '../game/find-game-form';
import JoinGameForm from '../game/join-game-form';

@route(({ app, game, config }) => ({
  room: app.room,
  error: app.error,
  player: app.player,
  tokens: config.playerTokens,
  connecting: app.waiting.includes('room:connected'),
  joining: app.waiting.includes('game:joined'),
  players: !game.players ? [] :
    game.players._all.map((token) => ({
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
    player: PropTypes.string,
    connecting: PropTypes.bool.isRequired,
    joining: PropTypes.bool.isRequired,
    players: PropTypes.arrayOf(PropTypes.object),
    connectToGame: PropTypes.func.isRequired,
    disconnectGame: PropTypes.func.isRequired,
    joinGame: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    params: PropTypes.shape({
      room: PropTypes.string
    }).isRequired
  };

  componentWillMount() {
    let {
      room,
      params,
      connectToGame
    } = this.props;

    if (params.room && params.room !== room) {
      connectToGame(params.room);
    }
  }

  componentWillReceiveProps(nextProps) {
    let {
      room:nextRoom,
      error,
      player,
      connecting,
      params,
      connectToGame,
      disconnectGame,
      push,
      replace
    } = nextProps;

    if (nextRoom && player) {
      push(`/${nextRoom}`);
    } else if (!nextRoom && params.room && error) {
      replace(`/join`);
    } else if (!error && !connecting) {
      if (!nextRoom && params.room) {
        connectToGame(params.room);
      } else if (nextRoom && !params.room) {
        if (!this.props.room) {
          push(`/${nextRoom}/join`);
        } else {
          disconnectGame();
        }
      }
    }
  }

  render() {
    let {
      room,
      error,
      tokens,
      connecting,
      joining,
      players,
      connectToGame,
      joinGame,
      params
    } = this.props;

    return (
      <Container data-test-join-game>
        <Section flex="none" row>
          <NavLeft/>

          <Heading data-test-join-game-heading>
            Join Game
          </Heading>

          <NavRight>
            {!!params.room && (
              <Text sm upper color="secondary" data-test-room-code>
                {params.room}
              </Text>
            )}
          </NavRight>
        </Section>
        {!params.room ? (
          <FindGameForm
              error={error}
              loading={connecting}
              onSubmit={connectToGame}/>
        ) : room ? (
          <JoinGameForm
              error={error}
              tokens={tokens}
              players={players}
              loading={joining}
              onSubmit={joinGame}/>
        ) : (
          <Section align="center" justify="center">
            <Spinner xl/>
          </Section>
        )}
      </Container>
    );
  }
}

export default JoinGameScreen;
