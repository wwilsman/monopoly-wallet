import React from 'react';
import PropTypes from 'prop-types';

import { Container, Section } from '../ui/layout';
import Heading from '../ui/typography/heading';

SandboxScreen.propTypes = {
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired
};

export default function SandboxScreen() {
  return (
    <Container>
      <Section flex="none">
        <Heading>Sandbox</Heading>
      </Section>
      <Section>
        {/* Develop new components here! */}
      </Section>
    </Container>
  );
}
