import React from 'react';

import { Container, Section } from '../ui/layout';
import Text from '../ui/text';

const Welcome = () => (
  <Container>
    <Section justify="center">
      <Text h1 center>
        Monopoly<br/>Wallet
      </Text>
    </Section>
    <Section>
      {/* buttons */}
    </Section>
  </Container>
);

export default Welcome;
