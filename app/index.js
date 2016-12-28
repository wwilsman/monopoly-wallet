import React from 'react'
import ReactDOM from 'react-dom'

if (process.env.NODE_ENV !== 'production') {
  window.Perf = require('react-addons-perf')
}

import { App } from './core'

const rootTag = document.getElementById('react-app')
ReactDOM.render(<App/>, rootTag)

if (module.hot) {
  module.hot.accept('./core', () => {
    ReactDOM.render(<App/>, rootTag)
  })
}
