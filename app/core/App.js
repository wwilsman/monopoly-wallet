import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { Router, Route, Switch, Redirect } from 'react-router'
import createHistory from 'history/createBrowserHistory'
import configureStore from './store'
import styles from './App.css'

import '../utils/injectResponderEventPlugin'

import { Welcome, NewGame, Game } from '../views'

class App extends Component {
  store = configureStore()
  history = createHistory()

  componentDidMount() {
    window.addEventListener('touchmove',
      this._preventDefault, { passive: false })
  }

  componentWillUnmount() {
    window.removeEventListener('touchmove',
      this._preventDefault, { passive: false })
  }

  _preventDefault(e) {
    e.preventDefault()
  }

  render() {
    return (
      <Provider store={this.store}>
        <Router history={this.history}>
          <Switch>
            <Route path="/" exact render={() => <Welcome/>}/>
            <Route path="/new" exact render={() => <NewGame/>}/>
            <Route path="/:gameID([^\/]{5})" render={() => <Game/>}/>
            <Route render={() => <Redirect to="/"/>}/>
          </Switch>
        </Router>
      </Provider>
    )
  }
}

export default App
