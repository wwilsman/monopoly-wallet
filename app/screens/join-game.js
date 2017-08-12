import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { connectToGame } from '../actions/game';

import { Container, Section } from '../ui/layout';
import Heading from '../ui/typography/heading';

import FindGameModal from '../game/find-game-modal';
import JoinGameForm from '../game/join-game-form';

@connect(({ game }) => ({
  room: game.room,
  loading: game.loading,
  error: game.error,
  tokens: game.config.playerTokens
}), {
  connectToGame,
  push
})

class JoinGame extends Component {
  static propTypes = {
    room: PropTypes.string,
    loading: PropTypes.bool,
    error: PropTypes.string,
    tokens: PropTypes.array,
    connectToGame: PropTypes.func.isRequired,
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
      room:nextRoom,
      match: { params:nextParams },
      push
    } = nextProps;

    if (nextRoom && (!nextParams.room || nextRoom !== nextParams.room)) {
      push(`/${nextRoom}/join`);
    } else if (!nextRoom && nextParams.room) {
      push('/join');
    }
  }

  render() {
    const {
      loading,
      error,
      tokens,
      connectToGame,
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
        ) : (
          <JoinGameForm
              tokens={tokens}
              onSubmit={(data) => console.log(data)}/>
        )}
      </Container>
    );
  }
}

export default JoinGame;
