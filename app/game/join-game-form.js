import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Container, Section } from '../ui/layout';
import Input from '../ui/forms/input';
import Button from '../ui/button';

import TokenSelect from './token-select';

class JoinGameForm extends Component {
  static propTypes = {
    tokens: PropTypes.arrayOf(PropTypes.string).isRequired,
    players: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool
  };

  state = {
    name: '',
    token: '',
    disabled: this.getDisabledTokens()
  };

  componentWillUpdate(nextProps, nextState) {
    const { players } = nextProps;
    const { name, token } = nextState;
    const existing = players.find((pl) => pl.token === token);
    const disabled = this.getDisabledTokens(name, players);

    if (existing && name !== existing.name) {
      this.setState({ token: '', disabled });
    } else if (disabled !== this.state.disabled) {
      this.setState({ disabled });
    }
  }

  getDisabledTokens(name = '', players = this.props.players) {
    const disabled = this.state && this.state.disabled;

    if (!disabled || players !== this.props.players || name !== this.state.name) {
      return players.map((player) => (player.active ? player.token : (
        name.toLowerCase() !== player.name.toLowerCase() && player.token
      ))).filter(Boolean);
    } else {
      return disabled;
    }
  }

  changeName = (name) => {
    this.setState({
      disabled: this.getDisabledTokens(name),
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
    const { loading, tokens } = this.props;
    const { name, token, disabled } = this.state;

    return (
      <Container
          tagName="form"
          onSubmit={this.handleSubmit}>
        <Section collapse>
          <Input
              label="Your name"
              value={name}
              placeholder="MR. MONOPOLY"
              disabled={loading}
              onChangeText={this.changeName}
              data-test-join-game-name-input/>
          <TokenSelect
              tokens={tokens}
              selected={token}
              disabled={disabled}
              disableAll={loading}
              onSelect={this.selectToken}
              data-test-join-game-token-select/>
        </Section>
        <Section flex="none">
          <Button
              block
              type="primary"
              loading={loading}
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
