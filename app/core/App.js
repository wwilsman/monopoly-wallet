import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Provider } from 'react-redux'
import { Match, Miss } from 'react-router'
import { AppContainer as HotContainer } from 'react-hot-loader'

import configureStore from './store'

import Router from './Router'
import { View } from './components'
import { Welcome } from '../welcome'
import {
  NewGame,
  GameContainer as Game
} from '../game'

class App extends Component {
  store = configureStore()

  render() {
    return (
      <HotContainer>
        <Provider store={this.store}>
          <Router store={this.store}>
            <View>
              <Match exactly pattern="/" component={Welcome}/>
              <Match exactly pattern="/new" component={NewGame}/>
              <Match pattern="/:gameID([^\/]{5})" component={Game}/>
            </View>
          </Router>
        </Provider>
      </HotContainer>
    )
  }
}

export default App
