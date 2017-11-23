import React, { Component } from 'react';
import PropTypes from 'prop-types';
import route from './route';

import { connectToGame, joinGame } from '../redux/game';

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
  tokens: config.playerTokens,
  joining: app.waiting.includes('game:joined'),
  players: !game.players ? [] :
    game.players._all.map((token) => ({
      active: app.players.includes(token),
      ...game.players[token]
    }))
}), {
  connectToGame,
  joinGame
})

class JoinGameScreen extends Component {
  static propTypes = {
    room: PropTypes.string,
    error: PropTypes.string,
    tokens: PropTypes.array,
    player: PropTypes.string,
    joining: PropTypes.bool.isRequired,
    players: PropTypes.arrayOf(PropTypes.object),
    connectToGame: PropTypes.func.isRequired,
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
      push,
      replace
    } = nextProps;

    // if we have a known player, send them to the game room
    if (nextRoom && player) {
      push(`/${nextRoom}`);
    // if we aren't connected and have an error, send them to find a room
    } else if (!nextRoom && error) {
      replace(`/join`);
    }
  }

  render() {
    let {
      room,
      error,
      tokens,
      joining,
      players,
      joinGame,
      location,
      params,
      goBack
    } = this.props;

    return (
      <Container data-test-join-game>
        {!room ? (
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
