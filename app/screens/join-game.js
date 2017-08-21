import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { connectToGame, joinGame } from '../actions/game';
import { getCurrentPlayers } from '../selectors/player';

import { Container, Section } from '../ui/layout';
import Heading from '../ui/typography/heading';

import FindGameModal from '../game/find-game-modal';
import JoinGameForm from '../game/join-game-form';

@connect((state) => ({
  room: state.game.room,
  loading: state.game.loading,
  error: state.game.error,
  players: getCurrentPlayers(state),
  tokens: state.game.config.playerTokens
}), {
  connectToGame,
  joinGame,
  push
})

class JoinGame extends Component {
  static propTypes = {
    room: PropTypes.string,
    loading: PropTypes.bool,
    error: PropTypes.string,
    tokens: PropTypes.array,
    players: PropTypes.arrayOf(PropTypes.object),
    connectToGame: PropTypes.func.isRequired,
    joinGame: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        room: PropTypes.string
      }).isRequired
    }).isRequired
  };

  componentWillMount() {
    const {
      room,
      match: { params },
      connectToGame
    } = this.props;

    if (params.room && params.room !== room) {
      connectToGame(params.room);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      error,
      room:nextRoom,
      match: { params:nextParams },
      push
    } = nextProps;

    if (!error) {
      if (nextRoom && (!nextParams.room || nextRoom !== nextParams.room)) {
        push(`/${nextRoom}/join`);
      } else if (!nextRoom && nextParams.room) {
        push('/join');
      }
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
      match: { params }
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
          <span>...</span>
        )}
      </Container>
    );
  }
}

export default JoinGame;
