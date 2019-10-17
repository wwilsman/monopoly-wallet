import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useGame, useEmit } from '../api';
import { useProperty } from '../helpers/hooks';

import { Container } from '../ui/layout';
import NavBar from '../ui/nav-bar';

import PropertyTransferForm from '../game/property-transfer-form';

BuyPropertyScreen.propTypes = {
  push: PropTypes.func.isRequired,
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired
};

export default function BuyPropertyScreen({ push, params }) {
  let { room } = useGame();
  let [ buy, { pending, ok }] = useEmit('property:buy');
  let property = useProperty(params.id);

  let handlePurchase = useCallback((amount) => {
    if (!pending) buy(params.id, amount);
  }, [pending, buy]);

  useEffect(() => {
    if (property.owner !== 'bank' || ok) push(`/${room}`);
  }, [ok]);

  return (
    <Container data-test-property-transfer>
      <NavBar
        title="Purchase"
        titleIcon="transfer"
        showBack={`/${room}/properties`}
        roomCode={room}
      />

      <PropertyTransferForm
        property={property}
        loading={pending}
        onSubmit={handlePurchase}
      />
    </Container>
  );
}
