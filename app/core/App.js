import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { Router, Route, Redirect, Switch } from 'react-router'
import createHistory from 'history/createBrowserHistory'
import configureStore from './store'
import styles from './App.css'

import '../utils/injectResponderEventPlugin'

import { Game, NewGame, Welcome } from '../views'

function preventDefault(e) {
  e.preventDefault()
}

class App extends Component {
  store = configureStore()
  history = createHistory()

  componentDidMount() {
    window.addEventListener('touchmove', preventDefault, { passive: false })
  }

  componentWillUnmount() {
    window.removeEventListener('touchmove', preventDefault, { passive: false })
  }

  render() {
    return (
      <Provider store={this.store}>
        <Router history={this.history}>
          <Switch>
            <Route path="/" exact render={() => <Welcome/>}/>
            <Route path="/new" exact render={() => <NewGame/>}/>
            <Route path="/:room([^\/]{5})" render={() => <Game/>}/>
            <Route render={() => <Redirect to="/"/>}/>
          </Switch>
        </Router>
      </Provider>
    )
  }
}

export default App
