import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import fetch from 'isomorphic-fetch'

import { EditConfig } from './index'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  heading: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10
  }
})

export class NewGame extends Component {

  constructor(...args) {
    super(...args)

    this.state = {
      availableThemes: [],
      activeTheme: ''
    }
  }

  componentDidMount() {
    fetch(`/api/themes`)
      .then((response) => response.json())
      .then(({ themes }) => {
        this.setState({ availableThemes: themes })

        // if (themes.length === 1) {
        //   this.chooseTheme(themes[0])
        // }
      })
  }

  chooseTheme(theme) {
    fetch(`/themes/${theme}/config.json`)
      .then((response) => response.json())
      .then((config) => {
        this.setState({
          activeTheme: theme,
          config
        })
      })
  }

  render() {
    const { availableThemes, activeTheme, config } = this.state

    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          New Game
        </Text>

        {!activeTheme && <View>
          <select onChange={(event) => this.chooseTheme(event.target.value)}>
            <option value="">
              -- Select Theme --
            </option>
            {availableThemes.map((theme) => (
              <option value={theme} key={theme}>
                {theme}
              </option>
            ))}
          </select>
        </View>}

        {config && <View>
          <Text style={styles.heading}>
            {activeTheme}
          </Text>
          <EditConfig config={config}/>
        </View>}
      </View>
    )
  }
}
