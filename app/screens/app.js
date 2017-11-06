import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch } from 'react-router-dom';

import { Container, Section } from '../ui/layout';
import Spinner from '../ui/spinner';

@connect(({ app }) => ({
  loading: app.loading
}))

class AppScreen extends Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    children: PropTypes.node
  };

  render() {
    const {
      loading,
      children
    } = this.props;

    return loading ? (
      <Container>
        <Section align="center" justify="center">
          <Spinner xl/>
        </Section>
      </Container>
    ) : (
      <Switch>
        {children}
      </Switch>
    );
  }
}

export default AppScreen;
