import React from 'react';

import { Container, Section } from '../ui/layout';
import Text from '../ui/text';

const JoinGame = ({ match: { params }}) => (
  <Container>
    <Section>
      <Text h1 center>Join Game</Text>
      <Text center>{params.room}</Text>
    </Section>
  </Container>
);

export default JoinGame;
