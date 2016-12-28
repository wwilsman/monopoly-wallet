import React, { Component, PropTypes } from 'react'
import { createSelector } from 'reselect'
import { connect } from 'react-redux'

import { getOrderedPlayers } from '../selectors'
import { View, Icon } from '../../core/components'

class GameNav extends Component {
  static contextTypes = {
    router: PropTypes.object
  }

  goToPath(pathname) {
    let { location } = this.props

    if (pathname !== location.pathname) {
      this.context.router.transitionTo({ pathname })
    }
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
    let { players, gameID } = this.props

    let bankPath = `/${gameID}/bank`
    let bankLinkStyle = { ...styles.link, ...styles.bankLink }

    if (this.isPathActive(bankPath)) {
      bankLinkStyle = { ...bankLinkStyle, ...styles.selected }
    }

    return (
      <View style={styles.container}>
        {players.map((p) => {
           let path = this.getPlayerPath(p)
           let linkStyle = styles.link

           if (this.isPathActive(path)) {
             linkStyle = { ...linkStyle, ...styles.selected }
           }

           return (
             <View
                 key={p._id}
                 style={linkStyle}
                 onClick={() => this.goToPath(path)}>
               <Icon style={styles.icon} name={p.token}/>
             </View>
          )
        })}

        <View
            style={bankLinkStyle}
            onClick={() => this.goToPath(bankPath)}>
          <Icon style={styles.icon} name="bank"/>
        </View>
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    gameID: state.game._id,
    currentPlayer: state.player,
    players: getOrderedPlayers(state),
    location: state.routing.location
  }
}

const GameNavContainer = connect(
  mapStateToProps
)(GameNav)

const styles = {
  container: {
    backgroundColor: '#444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
    paddingRight: 30,
    paddingBottom: 5,
    paddingLeft: 30
  },
  link: {
    width: 36,
    height: 36,
    borderRadius: 20,
    padding: 10
  },
  bankLink: {
    marginLeft: 'auto'
  },
  selected: {
    backgroundColor: '#888'
  },
  icon: {
    fontSize: 16,
    color: '#DDD'
  }
}

export default GameNavContainer
