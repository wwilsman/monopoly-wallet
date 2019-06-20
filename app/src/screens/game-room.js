import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { useGameActions } from '../redux/actions';
import { useApp, useWaitingFor } from '../utils';
import { load } from '../redux/persist';

import { Container, Section } from '../ui/layout';
import { NavLeft, NavRight } from '../ui/nav';
import Text from '../ui/typography/text';
import Toaster from '../ui/toaster';
import Spinner from '../ui/spinner';

GameRoomScreen.propTypes = {
  replace: PropTypes.func.isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      player: PropTypes.object
    }).isRequired
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
  let { room, player, error } = useApp();
  let { connectToGame, joinGame } = useGameActions();
  let connecting = useWaitingFor('room:connected');
  let joining = useWaitingFor('game:joined');
  let joined = !!player;

  let persisted = useMemo(() => {
    return location.state.player || load('app').player;
  }, [location.state.player]);

  if (!joined && persisted) {
    player = persisted;
  }

  if (error || !player || (room && room !== params.room)) {
    // if there was an error, no persisted player, or a different room
    replace(`/${params.room}/join`);
  } else if (!connecting && !room) {
    // if not connecting or connected to the room, connect
    connectToGame(params.room);
  } else if (room && !joining && !joined && player) {
    // if connected, not joining or joined, and there is a player, join
    joinGame(player.name, player.token);
  }

  return (
    <Container data-test-game-room>
      {!joined ? (
        <Section align="center" justify="center">
          <Spinner xl/>
        </Section>
      ) : (
        <>
          <Section key="header" flex="none" row>
            <NavLeft/>

            <Text color="lighter" icon={player.token} data-test-player-name>
              {player.name}
            </Text>

            <NavRight>
              {!!room && (
                <Text sm upper color="secondary" data-test-room-code>
                  {room}
                </Text>
              )}
            </NavRight>
          </Section>

          <Container key="content">
            {children}
          </Container>

          <Toaster key="toaster"/>
        </>
      )}
    </Container>
  );
}
