import React, { Component } from 'react';
import PropTypes from 'prop-types';
import route from './route';

import { Container, Section } from '../ui/layout';
import { NavLeft, NavRight } from '../ui/nav';
import Text from '../ui/typography/text';
import Toaster from '../ui/toaster';

@route(({ app, game }) => ({
  player: app.player && game.players[app.player]
}))

class GameRoomScreen extends Component {
  static propTypes = {
    player: PropTypes.object,
    replace: PropTypes.func.isRequired,
    params: PropTypes.shape({
      room: PropTypes.string.isRequired
    }).isRequired
  };

  componentWillMount() {
    let {
      player,
      params,
      replace
    } = this.props;

    if (!player) {
      replace(`/${params.room}/join`);
    }
  }

  render() {
    let { params } = this.props;

    return (
      <Container data-test-game-room>
        <Section flex="none" row>
          <NavLeft/>

          <NavRight>
            {!!params.room && (
              <Text sm upper color="secondary" data-test-room-code>
                {params.room}
              </Text>
            )}
          </NavRight>
        </Section>

        <Toaster/>
      </Container>
    );
  }
}

export default GameRoomScreen;
