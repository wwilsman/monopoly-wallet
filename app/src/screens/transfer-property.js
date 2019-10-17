import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useGame, useEmit } from '../api';
import { usePlayers, useProperty } from '../helpers/hooks';

import { Container } from '../ui/layout';
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
        title="Transfer"
        titleIcon="transfer"
        showBack={`/${room}/properties`}
        roomCode={room}
      />

      <PropertyTransferForm
        players={players}
        property={property}
        loading={pending}
        onSubmit={handleTransfer}
      />
    </Container>
  );
}
