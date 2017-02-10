import React from 'react'
import ReactDOM from 'react-dom'

import { AppContainer } from 'react-hot-loader'
import App from './core/App'

import Perf from 'react-addons-perf'
window.Perf = Perf

const render = () => {
  ReactDOM.render(
    <AppContainer><App/></AppContainer>,
    document.getElementById('react-app')
  )
}

if (module.hot) {
  module.hot.accept('./core/App', render)
}

render()
