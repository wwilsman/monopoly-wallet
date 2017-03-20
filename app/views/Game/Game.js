import React, { Component, PropTypes } from 'react'
import { Route, Redirect, Switch } from 'react-router'

import { Flex } from '../../layout'
import { Toaster } from '../../toaster'

import {
  JoinGame,
  Player,
  Search,
  Auction,
  Errored
} from '../'

class Game extends Component {
  static propTypes = {
    connectGame: PropTypes.func.isRequired,
    currentPlayer: PropTypes.object,
    isWaitingForAuction: PropTypes.bool,
    hasAuction: PropTypes.bool,
    hasError: PropTypes.bool,
    room: PropTypes.string
  }

  static contextTypes = {
    router: PropTypes.shape({
      push: PropTypes.func.isRequired,
      match: PropTypes.shape({
        url: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
        params: PropTypes.shape({
          room: PropTypes.string.isRequired
        }).isRequired
      }).isRequired
    }).isRequired
  }

  componentWillMount() {
    const { match: { params } } = this.context.router
    const { room, connectGame } = this.props

    if (!room) {
      connectGame(params.room)
    }
  }

  componentWillReceiveProps(props) {
    const { push, match: { params } } = this.context.router
    const wasWaitingForAuction = this.props.isWaitingForAuction
    const { isWaitingForAuction } = props

    if (wasWaitingForAuction && !isWaitingForAuction) {
      push(`/${params.room}/auction`)
    }
  }

  shouldComponentUpdate({ currentPlayer, hasError }) {
    return this.props.currentPlayer !== currentPlayer ||
           this.props.hasError !== hasError
  }

  render() {
    const {
      hasError,
      currentPlayer,
      hasAuction
    } = this.props

    const {
      match: { path, url }
    } = this.context.router

    return hasError ? (
      <Errored/>
    ) : (
      <Flex container>
        {currentPlayer ? (
           <Switch>
             <Route path={path} exact render={() => <Player/>}/>
             <Route path={`${path}/search`} exact render={() => <Search/>}/>

             {hasAuction && (
                <Route path={`${path}/auction`} exact render={() => <Auction/>}/>
              )}

             <Route render={() => <Redirect to={url}/>}/>
           </Switch>
         ) : (
           <Switch>
             <Route path={path} exact render={() => <JoinGame/>}/>
             <Route render={() => <Redirect to={url}/>}/>
           </Switch>
         )}

        <Toaster/>
      </Flex>
    )
  }
}

export default Game
