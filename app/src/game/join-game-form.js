import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import { useConfig, usePlayers } from '../helpers/hooks';
import { Container, Section } from '../ui/layout';
import Input from '../ui/forms/input';
import Button from '../ui/button';

import TokenSelect from './token-select';

JoinGameForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string
};

export default function JoinGameForm({
  onSubmit,
  loading,
  error
}) {
  let players = usePlayers();
  let { playerTokens: tokens = [] } = useConfig();
  let [ name, setName ] = useState('');
  let [ token, setToken ] = useState('');

  let disabled = useMemo(() => (
    players.reduce((acc, player) => (
      (player.active || player.name.toUpperCase() !== name)
        ? acc.concat(player.token)
        : acc
    ), [])
  ), [name, players]);

  let handleSubmit = useCallback(e => {
    e.preventDefault();

    if (name && token) {
      onSubmit(name, token);
    }
  }, [name, token, onSubmit]);

  let handleChangeName = useCallback(name => {
    setName(name.toUpperCase());
  }, [setName]);

  let handleTokenSelect = useCallback(token => {
    setToken(token);
  }, [setToken]);

  return (
    <Container
      tagName="form"
      onSubmit={handleSubmit}
    >
      <Section collapse>
        <Input
          label="Your name"
          value={name}
          placeholder="MR. MONOPOLY"
          disabled={!!error || loading}
          onChangeText={handleChangeName}
          data-test-join-game-name-input
        />
        <TokenSelect
          tokens={tokens}
          selected={token}
          disabled={disabled}
          disableAll={!!error || loading}
          onSelect={handleTokenSelect}
          data-test-join-game-token-select
        />
      </Section>
      <Section flex="none">
        <Button
          block
          type="submit"
          style={error ? 'alert' : 'primary'}
          loading={loading && !disabled.length}
          disabled={!!error || loading || !name || !token}
          data-test-join-game-btn
        >
          {error || (
            !!disabled.length
              ? (loading ? 'Asking...' : 'Ask to Join')
              : 'Join Game'
          )}
        </Button>
      </Section>
    </Container>
  );
}
