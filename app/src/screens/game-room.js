import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { useGame, useGameEffect, useEmit } from '../api';
import ls from '../helpers/storage';

import { Container, Section } from '../ui/layout';
import Toaster from '../ui/toaster';
import Spinner from '../ui/spinner';

GameRoomScreen.propTypes = {
  replace: PropTypes.func.isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      player: PropTypes.object
    })
  }).isRequired,
  params: PropTypes.shape({
    room: PropTypes.string.isRequired
  }).isRequired,
  children: PropTypes.node.isRequired
};

export default function GameRoomScreen({
  replace,
  location,
  params,
  children
}) {
  let { room, player } = useGame();
  let [ connect, connected ] = useEmit('room:connect');
  let [ join, joined ] = useEmit('game:join');
  let error = connected.error || joined.error;

  useGameEffect(({ room, player }) => player && ls.save({ room, player }));
  useEffect(() => () => ls.save({ room: '', player: null }), []);

  useEffect(() => {
    let persisted = player || location.state?.player || (
      ls.load('room') === params.room && ls.load('player')
    );

    if (error || !persisted || (room && room !== params.room)) {
      replace(`/${params.room}/join`);
    } else if (room && !joined.pending && !player && persisted) {
      join(persisted.name, persisted.token);
    } else if (!room && !connected.pending) {
      connect(params.room);
    }
  }, [room, player, error]);

  return (
    <Container data-test-game-room>
      {!player ? (
        <Section align="center" justify="center">
          <Spinner xl/>
        </Section>
      ) : (
        <>
          {children}
          <Toaster/>
        </>
      )}
    </Container>
  );
}
