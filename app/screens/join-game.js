import React, { Component } from 'react';
import PropTypes from 'prop-types';
import route from './route';

import {
  connectToGame,
  disconnectGame,
  joinGame
} from '../redux/game';

import { Container, Section } from '../ui/layout';
import Heading from '../ui/typography/heading';
import Spinner from '../ui/spinner';

import FindGameModal from '../game/find-game-modal';
import JoinGameForm from '../game/join-game-form';

@route(({ app, game }) => ({
  room: game.room,
  loading: game.loading,
  error: game.error,
  tokens: game.config.playerTokens,
  player: app.player,
  players: !game.state.players ? [] :
    game.state.players._all.map((token) => ({
      active: app.players.includes(token),
      ...game.state.players[token]
    }))
}), {
  connectToGame,
  disconnectGame,
  joinGame
})

class JoinGameScreen extends Component {
  static propTypes = {
    room: PropTypes.string,
    loading: PropTypes.bool,
    error: PropTypes.string,
    tokens: PropTypes.array,
    player: PropTypes.string,
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
      error,
      loading,
      player,
      room:nextRoom,
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
    } else if (!error && !loading) {
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
      loading,
      error,
      tokens,
      players,
      connectToGame,
      joinGame,
      params
    } = this.props;

    return (
      <Container data-test-join-game>
        <Section flex="none">
          <Heading data-test-join-game-heading>
            Join Game
          </Heading>
        </Section>
        {!params.room ? (
          <FindGameModal
              error={error}
              loading={loading}
              onFindGame={connectToGame}/>
        ) : room ? (
          <JoinGameForm
              tokens={tokens}
              players={players}
              loading={loading}
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
