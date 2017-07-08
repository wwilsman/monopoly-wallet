import React from 'react';

import { Container, Section } from '../ui/layout';
import Text from '../ui/text';
import Button from '../ui/button';

const Welcome = () => (
  <Container>
    <Section justify="center">
      <Text h1 center>
        Monopoly<br/>Wallet
      </Text>
    </Section>

    <Section align="center">
      <Button color="green">
        New Game
      </Button>

      <Button linkTo="/join" color="blue">
        Join Game
      </Button>
    </Section>
  </Container>
);

export default Welcome;
