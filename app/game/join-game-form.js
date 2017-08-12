import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Container, Section } from '../ui/layout';
import Input from '../ui/forms/input';
import Button from '../ui/button';

import TokenSelect from './token-select';

class JoinGameForm extends Component {
  static propTypes = {
    tokens: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired
  };

  state = {
    name: '',
    token: ''
  };

  changeName = (name) => {
    this.setState({
      name: name.toUpperCase()
    });
  };

  selectToken = (token) => {
    this.setState({ token });
  };

  handleSubmit = (e) => {
    const { name, token } = this.state;
    const { onSubmit } = this.props;

    e.preventDefault();

    if (name && token) {
      onSubmit({ name, token });
    }
  };

  render() {
    const { tokens } = this.props;
    const { name, token } = this.state;

    return (
      <Container
          tagName="form"
          onSubmit={this.handleSubmit}>
        <Section collapse>
          <Input
              label="Your name"
              value={name}
              placeholder="MR. MONOPOLY"
              onChangeText={this.changeName}
              data-test-join-game-name-input/>
          <TokenSelect
              tokens={tokens}
              selected={token}
              onSelect={this.selectToken}
              data-test-join-game-token-select/>
        </Section>
        <Section flex="none">
          <Button
              block
              type="primary"
              disabled={!name || !token}
              onClick={this.handleSubmit}
              data-test-join-game-btn>
            Join Game
          </Button>
        </Section>
      </Container>
    );
  }
}

export default JoinGameForm;
