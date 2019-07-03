import React from 'react';

import { useApp } from '../utils';
import { Container } from '../ui/layout';
import { Text } from '../ui/typography';
import NavBar from '../ui/nav-bar';

export default function BankScreen() {
  let { room } = useApp();

  return (
    <Container data-test-bank>
      <NavBar showBack roomCode={room}>
        <Text
          upper
          icon="bank"
          color="lighter"
          data-test-player-name
        >
          Bank
        </Text>
      </NavBar>
    </Container>
  );
}
