import React from 'react';

import { useGame } from '../api';

import { Container, Section } from '../ui/layout';
import { Text } from '../ui/typography';
import NavBar from '../ui/nav-bar';
import Card from '../ui/card';

export default function BankScreen() {
  let { room } = useGame();

  return (
    <Container data-test-bank>
      <NavBar
        title="Bank"
        titleIcon="bank"
        showBack={`/${room}`}
        roomCode={room}
      />

      <Section>
        <Card linkTo={`/${room}/transfer`}>
          <Text upper icon="transfer">
            Transfer
          </Text>
        </Card>

        <Card linkTo={`/${room}/properties`}>
          <Text upper icon="bank">
            Properties
          </Text>
        </Card>
      </Section>
    </Container>
  );
}
