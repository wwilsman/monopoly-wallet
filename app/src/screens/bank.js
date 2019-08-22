import React from 'react';

import { useGame } from '../api';

import { Container, Section } from '../ui/layout';
import { Text } from '../ui/typography';
import NavBar from '../ui/nav-bar';
import Link from '../ui/link';

export default function BankScreen() {
  let { room } = useGame();

  return (
    <Container data-test-bank>
      <NavBar
        showBack={`/${room}`}
        roomCode={room}
      >
        <Text
          upper
          icon="bank"
          color="lighter"
          data-test-screen-title
        >
          Bank
        </Text>
      </NavBar>

      <Section align="center" justify="center">
        <Link to={`/${room}/transfer`}>
          <Text upper icon="transfer">
            Transfer
          </Text>
        </Link>
      </Section>
    </Container>
  );
}
