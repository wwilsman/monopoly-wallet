import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { AppContainer } from 'react-hot-loader'

import { configureStore } from './store'

import {
  Welcome
} from '../welcome'

import {
  NewGame,
  GameContainer,
  JoinGameContainer
} from '../game'

export class Root extends Component {
  constructor(props) {
    super(props)

    this.store = configureStore()
    this.history = syncHistoryWithStore(browserHistory, this.store)
  }

  render() {
    return (
      <AppContainer>
        <Provider store={this.store}>
          <Router history={this.history}>
            <Route path="/" component={Welcome}/>
            <Route path="/new" component={NewGame}/>
            <Route path="/:gameID" component={GameContainer}>
              <Route path="/:gameID/join" component={JoinGameContainer}/>
            </Route>
          </Router>
        </Provider>
      </AppContainer>
    )
  }
}
