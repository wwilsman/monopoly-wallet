import React, { Component, PropTypes } from 'react'
import { View } from 'react-native'
import { connect } from 'react-redux'

import { Provider } from 'react-redux'
import { Match, Miss } from 'react-router'
import { AppContainer as HotContainer } from 'react-hot-loader'

import configureStore from './store'

import Router from './Router'
import { Welcome } from '../welcome'
import { NewGame, GameContainer } from '../game'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.store = configureStore()
  }

  render() {
    return (
      <HotContainer>
        <Provider store={this.store}>
          <Router store={this.store}>
            <View style={{ flex: 1 }}>
              <Match exactly pattern="/" component={Welcome}/>
              <Match exactly pattern="/new" component={NewGame}/>
              <Match pattern="/:gameID([^\/]{5})" component={GameContainer}/>
            </View>
          </Router>
        </Provider>
      </HotContainer>
    )
  }
}
