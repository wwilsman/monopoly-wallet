import React, { Component } from 'react'
import ThemeSprites from '../containers/ThemeSprites'
import PlayerForm from '../containers/PlayerForm'
import io from 'socket.io-client'

export default class App extends Component {

  constructor() {
    super(...arguments)
    this.socket = window.socket = io('/game')
  }

  render() {
    return (
      <div>
        <h1>Hello Monopoly!</h1>
        <ThemeSprites name="tokens"/>
      </div>
    )
  }
}
