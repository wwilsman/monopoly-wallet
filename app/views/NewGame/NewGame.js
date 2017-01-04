import React, { Component, PropTypes } from 'react'
import fetch from 'isomorphic-fetch'

import {
  View,
  Container,
  Header,
  Footer,
  Content,
  Button
} from '../../common'

import { ThemeSelect } from '../../game'

class NewGame extends Component {
  static contextTypes = {
    router: PropTypes.object
  }

  state = {
    themes: [],
    selectedTheme: ''
  }

  componentWillMount() {
    fetch('/api/themes')
      .then((response) => response.json())
      .then(({ themes }) => this.setState({ themes }))
  }

  selectTheme = (themeID) => {
    this.setState({ selectedTheme: themeID })
  }

  createGame = () => {
    const { selectedTheme } = this.state
    const { router } = this.context

    const fetchOptions = {
      method: 'POST',
      body: JSON.stringify({ theme: selectedTheme }),
      headers: { 'Content-Type': 'application/json' },
    }

    fetch('/api/new', fetchOptions)
      .then((response) => response.json())
      .then(({ gameID }) => router.transitionTo({
        pathname: `/${gameID}`
      }))
  }

  render() {
    const { themes, selectedTheme } = this.state

    return (
      <Container>
        <Header>New Game</Header>

        <Content>
          <ThemeSelect
              themes={themes}
              selected={selectedTheme}
              onChange={this.selectTheme}
          />
        </Content>

        <Footer>
          <Button secondary disabled={true || !selectedTheme}>
            Adjust Settings
          </Button>

          <Button disabled={!selectedTheme} onPress={this.createGame}>
            Create Game
          </Button>
        </Footer>
      </Container>
    )
  }
}

export default NewGame
