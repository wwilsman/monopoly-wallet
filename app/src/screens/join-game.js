import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import { useGame, useEmitter, useEmit } from '../api';
import ls from '../helpers/storage';

import { Container, Section } from '../ui/layout';
import { Heading } from '../ui/typography';
import NavBar from '../ui/nav-bar';
import Spinner from '../ui/spinner';

import JoinGameForm from '../game/join-game-form';

JoinGameScreen.propTypes = {
  push: PropTypes.func.isRequired,
  replace: PropTypes.func.isRequired,
  params: PropTypes.shape({
    room: PropTypes.string
  }).isRequired
};

export default function JoinGameScreen({
  push,
  replace,
  params
}) {
  let { room, player } = useGame();
  let { disconnect } = useEmitter();
  let [ connect, connected ] = useEmit('room:connect');
  let [ join, joined ] = useEmit('game:join');
  let persisted = useMemo(() => ls.load('player'), []);

  let handleJoinGame = useCallback((name, token) => {
    if (!joined.pending) join(name, token);
  }, [joined.pending]);

  useEffect(() => {
    if (connected.error) replace('/join');
  }, [connected.error]);

  useEffect(() => {
    if (joined.ok) {
      let { room, player } = joined.data[0];
      push(`/${room}`, { player });
    }
  }, [joined.ok]);

  useEffect(() => {
    if (!room && !connected.pending) {
      connect(params.room);
    } else if (player || (room && room !== params.room)) {
      disconnect();
    }
  }, []);

  return (
    <Container data-test-join-game>
      {!room || connected.pending ? (
        <Section align="center" justify="center">
          <Spinner xl/>
        </Section>
      ) : (
        <>
          <NavBar showBack roomCode={params.room}>
            <Heading data-test-join-game-heading>
              Join Game
            </Heading>
          </NavBar>

          <JoinGameForm
            autofill={persisted}
            loading={joined.pending}
            error={joined.error?.message}
            onSubmit={handleJoinGame}
          />
        </>
      )}
    </Container>
  );
}
