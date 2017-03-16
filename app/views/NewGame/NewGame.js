import React, { Component, PropTypes } from 'react'
import fetch from 'isomorphic-fetch'

import { Flex, Header, Section, Title } from '../../layout'
import { Button } from '../../common'
import { ThemeSelect } from '../../game'

class NewGame extends Component {
  static contextTypes = {
    router: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired
  }

  state = {
    themes: [],
    selectedTheme: null,
    isLoading: false
  }

  componentWillMount() {
     return fetch('/api/themes')
       .then((response) => response.json())
       .then(({ themes }) => this.setState({ themes }))
  }

  componentWillUnmount() {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout)
    }
  }

  _handleThemeChange = (selectedTheme) => {
    this.setState({ selectedTheme })
  }

  _handleCreateGame = () => {
    const { push } = this.context.router
    const { selectedTheme: { theme } } = this.state

    const fetchOptions = {
      method: 'POST',
      body: JSON.stringify({ theme }),
      headers: { 'Content-Type': 'application/json' }
    }

    this.loadingTimeout = setTimeout(() => {
      this.setState({ isLoading: true })
    }, 100)

    fetch('/api/new', fetchOptions)
      .then((response) => response.json())
      .then(({ room }) => push(`/${room}`))
  }

  render() {
    const {
      themes,
      selectedTheme,
      isLoading
    } = this.state

    return (
      <Flex container>
        <Header>
          <Title>New Game</Title>
        </Header>

        <Section stretch>
          <ThemeSelect
              themes={themes}
              selected={selectedTheme}
              onChange={this._handleThemeChange}
          />
        </Section>

        <Section>
          <Button
              onClick={this._handleCreateGame}
              disabled={!selectedTheme}
              loading={isLoading}
              color="blue"
              width="full">
            Create Game
          </Button>
        </Section>
      </Flex>
    )
  }
}

export default NewGame
