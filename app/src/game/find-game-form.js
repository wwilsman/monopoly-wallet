import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import { Container, Section } from '../ui/layout';
import Input from '../ui/forms/input';
import Button from '../ui/button';

FindGameForm.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.string,
  onSubmit: PropTypes.func.isRequired
};

export default function FindGameForm({
  loading,
  error,
  onSubmit
}) {
  let [ room, setRoom ] = useState('');

  let changeRoom = useCallback(room => {
    setRoom(room.toUpperCase());
  }, [setRoom]);

  let handleSubmit = useCallback(e => {
    e.preventDefault();

    if (room) {
      onSubmit(room);
    }
  }, [room, onSubmit]);

  return (
    <Container
      tagName="form"
      onSubmit={handleSubmit}
    >
      <Section collapse>
        <Input
          label="room code"
          value={room}
          length={5}
          error={error}
          disabled={loading}
          onChangeText={changeRoom}
          onEnter={handleSubmit}
          data-test-find-game-input
        />
      </Section>
      <Section flex="none">
        <Button
          block
          type="submit"
          style="primary"
          loading={loading}
          disabled={room.length !== 5}
          data-test-find-game-btn
        >
          Find Room
        </Button>
      </Section>
    </Container>
  );
}
