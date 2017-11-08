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
    players: PropTypes.arrayOf(PropTypes.object),
    connectToGame: PropTypes.func.isRequired,
    disconnectGame: PropTypes.func.isRequired,
    joinGame: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    params: PropTypes.shape({
      room: PropTypes.string
    }).isRequired
  };

  componentWillMount() {
    const { room, params } = this.props;
    this.connectOrDisconnect(params.room, room);
  }

  componentWillReceiveProps(nextProps) {
    const {
      error,
      loading,
      room:nextRoom,
      params:nextParams,
      replace
    } = nextProps;

    if (!error && !loading && nextRoom !== nextParams.room) {
      this.connectOrDisconnect(nextParams.room, nextRoom);
    } else if (error && !nextRoom && nextParams.room) {
      replace('/join');
    }
  }

  connectOrDisconnect(targetRoom, currentRoom) {
    const {
      connectToGame,
      disconnectGame
    } = this.props;

    if (targetRoom && targetRoom !== currentRoom) {
      connectToGame(targetRoom);
    } else if (!targetRoom && currentRoom) {
      disconnectGame();
    }
  }

  render() {
    const {
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
