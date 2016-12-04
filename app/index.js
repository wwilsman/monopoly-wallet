import React from 'react'
import { AppRegistry } from 'react-native'

import { Root } from './core'

AppRegistry.registerComponent('Root', () => Root)
AppRegistry.runApplication('Root', {
  rootTag: document.getElementById('react-app')
})
