import React, { Component } from 'react'
import { StyleSheet, Text, View, ListView } from 'react-native'
import fetch from 'isomorphic-fetch'

export class NewGame extends Component {

  constructor(...args) {
    super(...args)

    this.ds = new ListView.DataSource({
      rowHasChanged(prev, next) {
        return prev.name !== next.name ||
          prev.description !== next.description
      }
    })

    this.state = {
      themes: this.ds.cloneWithRows([]),
      activeTheme: ''
    }
  }

  componentDidMount() {
    fetch(`/api/themes`)
      .then((response) => response.json())
      .then(({ themes }) => {
        let activeTheme = themes.length === 1 ? themes[0]._id : ''
        this.setState({
          themes: this.ds.cloneWithRows(themes),
          activeTheme
        })
      })
  }

  chooseTheme(themeID) {
    this.setState({ activeTheme: themeID })
  }

  render() {
    const { themes, activeTheme } = this.state

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>New Game</Text>
          <Text style={styles.subtitle}>Choose a version:</Text>
        </View>

        <ListView
          style={styles.body}
          dataSource={themes}
          renderRow={(theme) => {
            let isActive = activeTheme === theme._id

            return (
              <View style={[styles.card, isActive && styles.activeCard]}
                  onClick={() => this.chooseTheme(theme._id)}>
                <Text style={[styles.cardTitle, isActive && styles.activeCardText]}>{theme.name}</Text>
                <Text style={[styles.cardDesc, isActive && styles.activeCardText]}>{theme.description}</Text>
              </View>
            )
          }}
        />

        <View style={styles.footer}>
          <Text style={!activeTheme && styles.disabled}>Create Game</Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  header: {
    padding: 30
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center'
  },
  body: {
    flex: 1,
    alignSelf: 'stretch',
    paddingLeft: 20,
    paddingRight: 20
  },
  footer: {
    padding: 30
  },
  disabled: {
    opacity: 0.5
  },
  card: {
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 20,
    marginBottom: 20
  },
  activeCard: {
    backgroundColor: 'rgb(100,200,100)'
  },
  activeCardText: {
    color: 'white'
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 10
  },
  cardDesc: {
    fontSize: 14
  }
})
