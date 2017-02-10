import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { Router, Route, Switch, Redirect } from 'react-router'
import createHistory from 'history/createBrowserHistory'
import configureStore from './store'
import styles from './App.css'

import '../utils/injectResponderEventPlugin'

class App extends Component {
  store = configureStore()
  history = createHistory()

  render() {
    return (
      <Provider store={this.store}>
        <Router history={this.history}>
          <Switch>
            <Route path="/" exact render={() => <Welcome/>}/>
            <Route render={() => <Redirect to="/"/>}/>
          </Switch>
        </Router>
      </Provider>
    )
  }
}

export default App
