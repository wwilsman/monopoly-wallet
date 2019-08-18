import React from 'react';
import PropTypes from 'prop-types';

import { useGame, useGameEffect } from '../api';
import { Container, Section } from '../ui/layout';
import Spinner from '../ui/spinner';

AppScreen.propTypes = {
  children: PropTypes.node
};

export default function AppScreen({ children }) {
  let { connected } = useGame();

  useGameEffect(game => {
    if (process.env.NODE_ENV === 'development') {
      /* eslint-disable no-console */
      console.group('game update');
      console.log(game);
      console.groupEnd();
      /* eslint-enable no-console */
    }
  });

  return !connected ? (
    <Container data-test-app-connecting>
      <Section align="center" justify="center">
        <Spinner xl/>
      </Section>
    </Container>
  ) : (
    children
  );
}
