import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import {
  createBrowserHistory,
  createMemoryHistory
} from 'history';

import './styles/global.css';
import createStore from './redux/store';

import AppScreen from './screens/app';
import WelcomeScreen from './screens/welcome';
import JoinGameScreen from './screens/join-game';
import GameRoomScreen from './screens/game-room';
import SandboxScreen from './screens/sandbox';

class AppRoot extends Component {
  static propTypes = {
    test: PropTypes.bool
  };

  history = !this.props.test ?
    createBrowserHistory() :
    createMemoryHistory();

  socket = new WebSocket(
    `ws://${window.location.host}`
  );

  store = createStore({
    socket: this.socket,
    history: this.history,
    initialState: {
      router: {
        location: {
          pathname: this.history.location.pathname,
          state: this.history.location.state || {}
        }
      }
    }
  });

  render() {
    return (
      <Provider store={this.store}>
        <AppScreen path="/(.*)" redirect="/">
          <WelcomeScreen path="/"/>
          <JoinGameScreen path="/:room([^\/]{5})?/join"/>
          <GameRoomScreen path="/:room([^\/]{5})"/>

          {process.env.NODE_ENV === 'development' && (
            <SandboxScreen path="/sandbox"/>
          )}
        </AppScreen>
      </Provider>
    );
  }
}

export default AppRoot;
