import React, { Component, PropTypes } from 'react'
import { View, TouchableHighlight, StyleSheet } from 'react-native'
import { createSelector } from 'reselect'
import { connect } from 'react-redux'

import { getOrderedPlayers } from '../selectors'
import { Icon } from '../../core/components'

class GameNav extends Component {
  static contextTypes = {
    router: PropTypes.object
  }

  goToPath(pathname) {
    this.context.router.transitionTo({ pathname })
  }

  isPathActive(pathname) {
    return pathname === this.props.location.pathname
  }

  getPlayerPath(player) {
    let { gameID, currentPlayer } = this.props
    let pathname = `/${gameID}`

    if (player._id !== currentPlayer) {
      pathname = `/${gameID}/${player.token}`
    }

    return pathname
  }

  render() {
    let { players } = this.props

    return (
      <View style={styles.container}>
        {players.map((p) => {
          let path = this.getPlayerPath(p)

          return (
            <TouchableHighlight key={p._id}
                style={[styles.link, this.isPathActive(path) && styles.selected]}
                onPress={() => this.goToPath(path)}>
              <View>
                <Icon style={styles.icon} name={p.token}/>
              </View>
            </TouchableHighlight>
          )
        })}
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    gameID: state.game._id,
    currentPlayer: state.player,
    players: getOrderedPlayers(state)
  }
}

const GameNavContainer = connect(
  mapStateToProps
)(GameNav)

export default GameNavContainer

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
    paddingRight: 25,
    paddingBottom: 5,
    paddingLeft: 25
  },
  link: {
    width: 30,
    height: 30,
    borderRadius: 20,
    padding: 7,
    margin: 2
  },
  selected: {
    backgroundColor: '#888'
  },
  icon: {
    fontSize: 16,
    color: '#DDD'
  }
})
