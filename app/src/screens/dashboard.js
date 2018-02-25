import React, { Component } from 'react';
import PropTypes from 'prop-types';
import route from './route';

import { Container, Section } from '../ui/layout';

import Currency from '../ui/typography/currency';

@route(({ app, game }) => ({
  player: game.players[app.player.token]
}))

class DashboardScreen extends Component {
  static propTypes = {
    player: PropTypes.shape({
      balance: PropTypes.number.isRequired
    }).isRequired
  };

  render() {
    let { player } = this.props;

    return (
      <Container>
        <Section flex="none" collapse>
          <Currency xl center color="secondary" value={player.balance}/>
        </Section>
      </Container>
    );
  }
}

export default DashboardScreen;
