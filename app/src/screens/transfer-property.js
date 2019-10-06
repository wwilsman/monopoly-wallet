import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useGame, useEmit } from '../api';
import { usePlayers, useProperty } from '../helpers/hooks';

import { Container } from '../ui/layout';
import { Text } from '../ui/typography';
import NavBar from '../ui/nav-bar';

import PropertyTransferForm from '../game/property-transfer-form';

TransferPropertyScreen.propTypes = {
  push: PropTypes.func.isRequired,
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired
};

export default function TransferPropertyScreen({ push, params }) {
  let { room, player } = useGame();
  let [ transfer, { pending, ok }] = useEmit('property:transfer');
  let players = usePlayers({ exclude: [player.token] });
  let property = useProperty(params.id);

  let handleTransfer = useCallback((token) => {
    if (!pending) transfer(params.id, token);
  }, [pending, transfer]);

  useEffect(() => {
    if (property.owner !== player.token || ok) push(`/${room}`);
  }, [ok]);

  return (
    <Container data-test-property-transfer>
      <NavBar
        showBack={`/${room}/properties`}
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

      <PropertyTransferForm
        players={players}
        property={property}
        loading={pending}
        onSubmit={handleTransfer}
      />
    </Container>
  );
}
