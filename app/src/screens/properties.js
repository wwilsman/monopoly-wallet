import React from 'react';

import { useGame } from '../api';
import { useProperties } from '../helpers/hooks';

import { Container } from '../ui/layout';
import { Text } from '../ui/typography';
import NavBar from '../ui/nav-bar';
import PropertySearch from '../game/property-search';

export default function PropertiesScreen() {
  let { room } = useGame();
  let properties = useProperties('bank');

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
      />
    </Container>
  );
}
