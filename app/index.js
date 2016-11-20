import React from 'react'
import { AppRegistry } from 'react-native'

import { App } from './components/App'

AppRegistry.registerComponent('App', () => App)
AppRegistry.runApplication('App', {
  rootTag: document.getElementById('react-app')
})
