import React from 'react';
import PropTypes from 'prop-types';

import { useWaitingFor } from '../utils';
import { Container, Section } from '../ui/layout';
import Spinner from '../ui/spinner';

AppScreen.propTypes = {
  children: PropTypes.node
};

export default function AppScreen({ children }) {
  let loading = useWaitingFor('connected');

  return loading ? (
    <Container>
      <Section align="center" justify="center">
        <Spinner xl/>
      </Section>
    </Container>
  ) : (
    children
  );
}
