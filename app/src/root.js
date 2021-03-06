import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';

import './styles/global.css';
import Router, { Route } from './router';
import ApiProvider from './api';

import AppScreen from './screens/app';
import WelcomeScreen from './screens/welcome';
import FindRoomScreen from './screens/find-room';
import JoinGameScreen from './screens/join-game';
import GameRoomScreen from './screens/game-room';
import DashboardScreen from './screens/dashboard';
import BankScreen from './screens/bank';
import TransferScreen from './screens/transfer';
import PropertiesScreen from './screens/properties';
import BuyPropertyScreen from './screens/buy-property';
import TransferPropertyScreen from './screens/transfer-property';
import SandboxScreen from './screens/sandbox';

AppRoot.propTypes = {
  history: PropTypes.object.isRequired,
  onGameUpdate: PropTypes.func
};

function AppRoot({
  onGameUpdate,
  history
}) {
  let roompath = ':room([^/]{5})';

  return (
    <ApiProvider onUpdate={onGameUpdate}>
      <Router history={history}>
        <Route path="/(.*)" redirect="/" render={AppScreen}>
          <Route path="/" render={WelcomeScreen}/>
          <Route path="/join" render={FindRoomScreen}/>
          <Route path={`/${roompath}/join`} render={JoinGameScreen}/>

          <Route path={`/${roompath}/(.*)?`} render={GameRoomScreen}>
            <Route path={`/${roompath}`} render={DashboardScreen}/>
            <Route path={`/${roompath}/bank`} render={BankScreen}/>
            <Route path={`/${roompath}/transfer`} render={TransferScreen}/>
            <Route path={`/${roompath}/properties`} render={PropertiesScreen}/>
            <Route path={`/${roompath}/:token/properties`} render={PropertiesScreen}/>
            <Route path={`/${roompath}/:id/buy`} render={BuyPropertyScreen}/>
            <Route path={`/${roompath}/:id/transfer`} render={TransferPropertyScreen}/>
          </Route>

          {process.env.NODE_ENV === 'development' && (
            <Route path="/sandbox" render={SandboxScreen}/>
          )}
        </Route>
      </Router>
    </ApiProvider>
  );
}

export default hot(AppRoot);
