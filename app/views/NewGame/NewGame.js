import React, { Component, PropTypes } from 'react'
import fetch from 'isomorphic-fetch'

import { Flex, Box, Title } from '../../layout'
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
    loading: false
  }

  componentWillMount() {
     return fetch('/api/themes')
      .then((response) => response.json())
      .then(({ themes }) => this.setState({ themes }))
  }

  componentWillUnmount() {
    if (this._loadingTimeout) {
      clearTimeout(this._loadingTimeout)
    }
  }

  _handleThemeChange = (selectedTheme) => {
    this.setState({ selectedTheme })
  }

  _createGame = () => {
    const { router } = this.context
    const { selectedTheme } = this.state

    const fetchOptions = {
      method: 'POST',
      body: JSON.stringify({ theme: selectedTheme._id }),
      headers: { 'Content-Type': 'application/json' }
    }

    this._loadingTimeout = setTimeout(() => {
      this.setState({ loading: true })
    }, 100)

    fetch('/api/new', fetchOptions)
      .then((response) => response.json())
      .then(({ room }) => router.push(`/${room}`))
  }

  render() {
    const { themes, selectedTheme, loading } = this.state

    return (
      <Flex>
        <Box size="1/8">
          <Title>New Game</Title>
        </Box>

        <Box stretch>
          <ThemeSelect
              themes={themes}
              selected={selectedTheme}
              onChange={this._handleThemeChange}
          />
        </Box>

        <Box>
          <Button
              color="blue"
              width="full"
              disabled={!selectedTheme}
              onClick={this._createGame}>
            Create Game
          </Button>
        </Box>
      </Flex>
    )
  }
}

export default NewGame
