import React, { Component, PropTypes } from 'react'
import fetch from 'isomorphic-fetch'

import { Container, Header, Content, Footer } from '../layout'
import { Button, Label } from '../core/components'
import { ThemeSelect } from './components'

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
      .then(({ themes }) => {
        const selectedTheme = themes.length === 1 ? themes[0]._id : ''
        this.setState({ themes, selectedTheme })
      })
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
          <Label>Choose a version:</Label>

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

          <Button disabled={!selectedTheme} onClick={this.createGame}>
            Create Game
          </Button>
        </Footer>
      </Container>
    )
  }
}

export default NewGame
