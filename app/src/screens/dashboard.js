import React from 'react';

import { usePlayer } from '../utils';

import { Container, Section } from '../ui/layout';
import Currency from '../ui/typography/currency';

export default function DashboardScreen() {
  let player = usePlayer();

  return (
    <Container>
      <Section flex="none" collapse>
        <Currency xl center color="secondary" value={player.balance}/>
      </Section>
    </Container>
  );
}
