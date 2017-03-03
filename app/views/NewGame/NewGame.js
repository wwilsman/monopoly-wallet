import React, { Component, PropTypes } from 'react'
import fetch from 'isomorphic-fetch'

import { Flex, Box, Title } from '../../layout'
import { Button } from '../../common'
import { ThemeSelect } from '../../game'

class NewGame extends Component {
  static contextTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired
  }

  state = {
    themes: [],
    selectedTheme: null
  }

  componentWillMount() {
     return fetch('/api/themes')
      .then((response) => response.json())
      .then(({ themes }) => this.setState({ themes }))
  }

  _handleThemeChange = (selectedTheme) => {
    this.setState({ selectedTheme })
  }

  _createGame = () => {
    const { history } = this.context
    const { selectedTheme } = this.state

    const fetchOptions = {
      method: 'POST',
      body: JSON.stringify({ theme: selectedTheme._id }),
      headers: { 'Content-Type': 'application/json' }
    }

    fetch('/api/new', fetchOptions)
      .then((response) => response.json())
      .then(({ gameID }) => history.push(`/${gameID}`))
  }

  render() {
    const { themes, selectedTheme } = this.state

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
