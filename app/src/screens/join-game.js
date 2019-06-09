import React from 'react';
import PropTypes from 'prop-types';

import { useGameActions } from '../redux/actions';
import {
  useApp,
  useConfig,
  usePlayers,
  useWaitingFor,
  usePrevious
} from '../utils';

import { Container, Section } from '../ui/layout';
import { NavLeft, NavRight } from '../ui/nav';
import { Heading, Text } from '../ui/typography';
import Spinner from '../ui/spinner';
import Button from '../ui/button';
import Icon from '../ui/icon';

import JoinGameForm from '../game/join-game-form';

JoinGameScreen.propTypes = {
  push: PropTypes.func.isRequired,
  replace: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      internal: PropTypes.bool
    }).isRequired
  }).isRequired,
  params: PropTypes.shape({
    room: PropTypes.string
  }).isRequired
};

export default function JoinGameScreen({
  push,
  replace,
  goBack,
  location,
  params
}) {
  let { room, error, player } = useApp();
  let { playerTokens: tokens } = useConfig();
  let joining = useWaitingFor('game:joined');
  let connecting = useWaitingFor('room:connected');
  let prevJoining = usePrevious(joining);
  let players = usePlayers();

  let {
    connectToGame,
    disconnectGame,
    joinGame
  } = useGameActions();

  if (!joining && prevJoining && player) {
    // if a player joined, send them to the game room
    push(`/${room}`, { player });
  } else if (room && (params.room !== room || prevJoining == null)) {
    // if we were connected to a different room
    disconnectGame();
  } else if (!connecting && !room) {
    // if not connecting or connected to the room, connect
    connectToGame(params.room);
  } else if (connecting && error) {
    // if we have an issue connecting, send them to find a room
    replace('/join');
  }

  return (
    <Container data-test-join-game>
      {connecting ? (
        <Section align="center" justify="center">
          <Spinner xl/>
        </Section>
      ) : (
        <>
          <Section flex="none" row>
            <NavLeft>
              {location.state.internal && (
                <Button style="icon" onClick={goBack} data-test-back>
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
          </Section>

          <JoinGameForm
            key={1}
            error={error}
            tokens={tokens}
            players={players}
            loading={joining}
            onSubmit={joinGame}
          />
        </>
      )}
    </Container>
  );
}
