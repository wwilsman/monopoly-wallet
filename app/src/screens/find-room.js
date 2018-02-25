import React, { Component } from 'react';
import PropTypes from 'prop-types';
import route from './route';

import { connectToGame, disconnectGame } from '../redux/game';

import { Container, Section } from '../ui/layout';
import { NavLeft, NavRight } from '../ui/nav';
import Heading from '../ui/typography/heading';
import Button from '../ui/button';
import Icon from '../ui/icon';

import FindGameForm from '../game/find-game-form';

@route(({ app }) => ({
  room: app.room,
  error: app.error,
  connecting: app.waiting.includes('room:connected')
}), {
  connectToGame,
  disconnectGame
})

class FindRoomScreen extends Component {
  static propTypes = {
    room: PropTypes.string,
    error: PropTypes.string,
    connecting: PropTypes.bool.isRequired,
    connectToGame: PropTypes.func.isRequired,
    disconnectGame: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    location: PropTypes.shape({
      state: PropTypes.object.isRequired
    }).isRequired
  };

  componentWillMount() {
    let { room, disconnectGame } = this.props;

    if (room) {
      disconnectGame(room);
    }
  }

  componentWillReceiveProps(nextProps) {
    let { room:nextRoom, push } = nextProps;

    // if we weren't connected before, send them to the join form
    if (nextRoom && !this.props.room) {
      push(`/${nextRoom}/join`);
    }
  }

  render() {
    let {
      error,
      connecting,
      connectToGame,
      location,
      goBack
    } = this.props;

    return (
      <Container data-test-find-room>
        <Section flex="none" row>
          <NavLeft>
            {location.state.internal && (
              <Button type="icon" onClick={goBack} data-test-back>
                <Icon name="larr"/>
              </Button>
            )}
          </NavLeft>

          <Heading data-test-find-room-heading>
            Join Game
          </Heading>

          <NavRight/>
        </Section>

        <FindGameForm
            error={error}
            loading={connecting}
            onSubmit={connectToGame}/>
      </Container>
    );
  }
}

export default FindRoomScreen;
