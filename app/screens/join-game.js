import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';

import {
  connectToGame,
  disconnectGame,
  joinGame
} from '../actions/game';
import {
  getCurrentPlayers
} from '../selectors/player';

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
  disconnectGame,
  joinGame,
  replace
})

class JoinGame extends Component {
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
    match: PropTypes.shape({
      params: PropTypes.shape({
        room: PropTypes.string
      }).isRequired
    }).isRequired
  };

  componentWillMount() {
    const { room, match: { params }} = this.props;
    this.connectOrDisconnect(params.room, room);
  }

  componentWillReceiveProps(nextProps) {
    const {
      error,
      loading,
      room:nextRoom,
      match: { params:nextParams },
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
