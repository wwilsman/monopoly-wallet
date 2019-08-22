import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useGame, useEmit } from '../api';
import { usePlayers } from '../helpers/hooks';

import { Container } from '../ui/layout';
import { Text } from '../ui/typography';
import NavBar from '../ui/nav-bar';

import TransferForm from '../game/transfer-form';

TransferScreen.propTypes = {
  push: PropTypes.func.isRequired
};

export default function TransferScreen({ push }) {
  let { room, player } = useGame();
  let players = usePlayers({ exclude: [player.token] });
  let [ transfer, { pending, ok }] = useEmit('player:transfer');

  let handleTransfer = useCallback((token, amount) => {
    if (!pending) transfer(token, amount);
  }, [pending]);

  useEffect(() => ok && push(`/${room}`), [ok]);

  return (
    <Container data-test-transfer>
      <NavBar
        showBack={`/${room}/bank`}
        roomCode={room}
      >
        <Text
          upper
          icon="transfer"
          color="lighter"
          data-test-screen-title
        >
          Transfer
        </Text>
      </NavBar>

      <TransferForm
        players={players}
        loading={pending}
        onSubmit={handleTransfer}
      />
    </Container>
  );
}
