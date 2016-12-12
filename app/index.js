import React from 'react'
import { AppRegistry } from 'react-native'

import { Root } from './core'

const rootTag = document.getElementById('react-app')

AppRegistry.registerComponent('App', () => Root)
AppRegistry.runApplication('App', { rootTag })

if (module.hot) {
  module.hot.accept('./core', () => {
    AppRegistry.runApplication('App', { rootTag })
  })
}
