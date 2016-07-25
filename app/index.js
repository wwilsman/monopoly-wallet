import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './components/App'
import configureStore from './store'

let store = configureStore({
  game: {
    theme: 'classic',
    tokens: [
      "automobile",
      "battleship",
      "boot",
      "iron",
      "scottish-terrier",
      "thimble",
      "top-hat",
      "wheelbarrow"
    ]
  }
})

render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root')
)
