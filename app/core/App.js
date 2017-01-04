import React, { Component } from 'react'
import s from './App.scss'

import { Provider } from 'react-redux'
import { Match, Miss, Redirect } from 'react-router'
import { AppContainer as HotContainer } from 'react-hot-loader'

import configureStore from './store'

import Router from './Router'
import { View } from '../common'
import { Welcome, NewGame, Game } from '../views'

class App extends Component {
  store = configureStore()

  render() {
    return (
      <HotContainer>
        <Provider store={this.store}>
          <Router store={this.store}>
            <View onTouchMove={(e) => e.preventDefault()}>
              <Match pattern="/" exactly component={Welcome}/>
              <Match pattern="/new" exactly component={NewGame}/>
              <Match pattern="/:gameID([^\/]{5})" component={Game}/>
              <Miss render={() => (<Redirect to="/"/>)}/>
            </View>
          </Router>
        </Provider>
      </HotContainer>
    )
  }
}

export default App
