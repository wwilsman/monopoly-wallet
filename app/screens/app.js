import React, { Component } from 'react';
import PropTypes from 'prop-types';
import route from './route';

import { Container, Section } from '../ui/layout';
import Spinner from '../ui/spinner';

@route(({ app }) => ({
  loading: app.loading
}))

class AppScreen extends Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    children: PropTypes.node
  };

  render() {
    return this.props.loading ? (
      <Container>
        <Section align="center" justify="center">
          <Spinner xl/>
        </Section>
      </Container>
    ) : (
      this.props.children
    );
  }
}

export default AppScreen;
