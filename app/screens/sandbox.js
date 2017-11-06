import React, { Component } from 'react';
import PropTypes from 'prop-types';
import route from './route';

import { Container, Section } from '../ui/layout';
import Heading from '../ui/typography/heading';

@route()
class SandboxScreen extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired
  };

  render() {
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
}

export default SandboxScreen;
