import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { configureStore } from '../store'

import {
  Home,
  NewGame,
  Game,
  JoinGame
} from '../containers'

const store = configureStore({})
const history = syncHistoryWithStore(browserHistory, store)

export class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router history={history}>
          <Route path="/" component={Home}/>
          <Route path="/new" component={NewGame}/>
          <Route path="/:gameID" component={Game}>
            <Route path="/:gameID/join" component={JoinGame}/>
          </Route>
        </Router>
      </Provider>
    )
  }
}
