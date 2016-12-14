import React, { Component, PropTypes } from 'react'
import fetch from 'isomorphic-fetch'

import {
  Container,
  Header,
  Content,
  Footer
} from '../layout'

import {
  Button,
  Label
} from '../core/components'

import {
  ThemeSelect
} from './components'

export default class NewGame extends Component {
  static contextTypes = {
    router: PropTypes.object
  }

  constructor(props) {
    super(props)

    this.state = {
      themes: [],
      selectedTheme: ''
    }
  }

  componentWillMount() {
    fetch('/api/themes')
      .then((response) => response.json())
      .then(({ themes }) => {
        let selectedTheme = themes.length === 1 ? themes[0]._id : ''
        this.setState({ themes, selectedTheme })
      })
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
            selectedTheme={selectedTheme}
            onChange={this.selectTheme}
          />
        </Content>

        <Footer>
          <Button secondary
              disabled={true || !selectedTheme}>
            Adjust Settings
          </Button>

          <Button
              disabled={!selectedTheme}
              onPress={this.createGame}>
            Create Game
          </Button>
        </Footer>
      </Container>
    )
  }

  selectTheme = (themeID) => {
    this.setState({ selectedTheme: themeID })
  }

  createGame = () => {
    let { selectedTheme } = this.state
    let { router } = this.context

    fetch('/api/new', {
      method: 'POST',
      body: JSON.stringify({ theme: selectedTheme }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .then(({ gameID }) => router.transitionTo({
        pathname: `/${gameID}`
      }))
  }
}
