import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch } from 'react-router-dom';

import { Container, Section } from '../ui/layout';
import Text from '../ui/typography/text';

@connect(({ app }) => ({
  loading: app.loading
}))

class App extends Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired
  };

  render() {
    const {
      loading,
      children
    } = this.props;

    return loading ? (
      <Container>
        <Section justify="center">
          <Text center>...</Text>
        </Section>
      </Container>
    ) : (
      <Switch children={children}/>
    );
  }
}

export default App;
