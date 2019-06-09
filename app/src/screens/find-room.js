import React from 'react';
import PropTypes from 'prop-types';

import { useApp, useWaitingFor, usePrevious } from '../utils';
import { useGameActions } from '../redux/actions';

import { Container, Section } from '../ui/layout';
import { NavLeft, NavRight } from '../ui/nav';
import Heading from '../ui/typography/heading';
import Button from '../ui/button';
import Icon from '../ui/icon';

import FindGameForm from '../game/find-game-form';

FindRoomScreen.propTypes = {
  push: PropTypes.func.isRequired,
  replace: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      internal: PropTypes.bool
    }).isRequired
  }).isRequired
};

export default function FindRoomScreen({
  push,
  goBack,
  location
}) {
  let { room, error } = useApp();
  let { connectToGame, disconnectGame } = useGameActions();
  let connecting = useWaitingFor('room:connected');
  let prevRoom = usePrevious(room);

  if (room && prevRoom === '') {
    // successfully connected to a new room
    push(`/${room}/join`);
  } else if (room) {
    // already connected to a room
    disconnectGame(room);
  }

  return (
    <Container data-test-find-room>
      <Section flex="none" row>
        <NavLeft>
          {location.state.internal && (
            <Button style="icon" onClick={goBack} data-test-back>
              <Icon name="larr"/>
            </Button>
          )}
        </NavLeft>

        <Heading data-test-find-room-heading>
          Join Game
        </Heading>

        <NavRight/>
      </Section>

      <FindGameForm
        error={error}
        loading={connecting}
        onSubmit={connectToGame}
      />
    </Container>
  );
}
