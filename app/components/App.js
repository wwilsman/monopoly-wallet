import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { configureStore } from '../store'

import { Home, NewGame } from './index'

const store = configureStore({})
const history = syncHistoryWithStore(browserHistory, store)

export class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router history={history}>
          <Route path="/">
            <IndexRoute component={Home}/>
            <Route path="new" component={NewGame}/>
          </Route>
        </Router>
      </Provider>
    )
  }
}
