import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { Provider as ReduxProvider } from 'react-redux';
import { createBrowserHistory, createMemoryHistory } from 'history';

import './styles/global.css';
import createStore from './redux/store';

import Route from './screens/route';
import AppScreen from './screens/app';
import WelcomeScreen from './screens/welcome';
import FindRoomScreen from './screens/find-room';
import JoinGameScreen from './screens/join-game';
import GameRoomScreen from './screens/game-room';
import DashboardScreen from './screens/dashboard';
import SandboxScreen from './screens/sandbox';

export function createAppContext() {
  let history = (process.env.NODE_ENV === 'test')
    ? createMemoryHistory() : createBrowserHistory();
  let socket = new WebSocket(`ws://${window.location.host}`);
  let store = createStore({ socket, history });
  return { history, socket, store };
}

AppRoot.propTypes = {
  context: PropTypes.shape({
    store: PropTypes.object.isRequired
  }).isRequired
};

function AppRoot({ context: { store } }) {
  let roompath = ':room([^/]{5})';

  return (
    <ReduxProvider store={store}>
      <Route path="/(.*)" redirect="/" render={AppScreen}>
        <Route path="/" render={WelcomeScreen}/>
        <Route path="/join" render={FindRoomScreen}/>
        <Route path={`/${roompath}/join`} render={JoinGameScreen}/>

        <Route path={`/${roompath}`} render={GameRoomScreen}>
          <Route path={`/${roompath}`} render={DashboardScreen}/>
        </Route>

        {process.env.NODE_ENV === 'development' && (
          <Route path="/sandbox" render={SandboxScreen}/>
        )}
      </Route>
    </ReduxProvider>
  );
}

export default hot(AppRoot);
