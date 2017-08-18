import React, { Component } from 'react';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import { Provider } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';
import {
  createBrowserHistory,
  createMemoryHistory
} from 'history';

import './styles/global.css';
import createStore from './store';

import App from './screens/app';
import Welcome from './screens/welcome';
import JoinGame from './screens/join-game';
import GameRoom from './screens/game-room';

class AppRoot extends Component {
  static propTypes = {
    test: PropTypes.bool
  };

  history = !this.props.test ?
    createBrowserHistory() :
    createMemoryHistory();

  socket = io('/');

  store = createStore({
    history: this.history,
    socket: this.socket
  });

  render() {
    return (
      <Provider store={this.store}>
        <ConnectedRouter history={this.history}>
          <Route path="/" render={(props) => (
            <App {...props}>
              <Route path="/" exact component={Welcome}/>
              <Route path="/join" exact component={JoinGame}/>
              <Route path="/:room([^\/]{5})/join" exact component={JoinGame}/>
              <Route path="/:room([^\/]{5})" exact component={GameRoom}/>
              <Route render={() => <Redirect to="/"/>}/>
            </App>
          )}/>
        </ConnectedRouter>
      </Provider>
    );
  }
}

export default AppRoot;
