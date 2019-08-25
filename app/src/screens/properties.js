import React, { useCallback, useEffect } from 'react';

import { useGame, useEmit } from '../api';
import { useProperties } from '../helpers/hooks';

import { Container } from '../ui/layout';
import { Text } from '../ui/typography';
import NavBar from '../ui/nav-bar';
import PropertySearch from '../game/property-search';

export default function PropertiesScreen({ push }) {
  let { room } = useGame();
  let properties = useProperties('bank');
  let [ buyProperty, buyResponse ] = useEmit('property:buy');

  let handlePurchase = useCallback((id, amount) => {
    if (!buyResponse.pending) buyProperty(id, amount);
  }, [buyProperty]);

  useEffect(() => {
    if (buyResponse.ok) push(`/${room}`);
  }, [buyResponse.ok]);

  return (
    <Container data-test-properties-search>
      <NavBar
        showBack={`/${room}/bank`}
        roomCode={room}
      >
        <Text
          upper
          icon="bank"
          color="lighter"
          data-test-screen-title
        >
          Properties
        </Text>
      </NavBar>

      <PropertySearch
        properties={properties}
        onPurchase={handlePurchase}
      />
    </Container>
  );
}
