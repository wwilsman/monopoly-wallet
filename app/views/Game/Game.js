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
    hasError: PropTypes.bool,
    room: PropTypes.string
  }

  static contextTypes = {
    router: PropTypes.shape({
      push: PropTypes.func.isRequired,
      listen: PropTypes.func.isRequired,
      location: PropTypes.shape({
        pathname: PropTypes.string.isRequired
      }).isRequired,
      match: PropTypes.shape({
        url: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
        params: PropTypes.shape({
          room: PropTypes.string.isRequired
        }).isRequired
      }).isRequired
    }).isRequired
  }

  state = {
    inAuction: false
  }

  componentWillMount() {
    const { listen, match: { params } } = this.context.router
    const { room, connectGame } = this.props

    if (!room) {
      connectGame(params.room)
    }

    this.unlisten = listen(({ pathname }) => {
      this.setState({
        inAuction: pathname.match(/\/auction/)
      })
    })
  }

  componentWillUnmount() {
    this.unlisten()
  }

  componentWillReceiveProps(props) {
    const { push, match } = this.context.router

    const wasWaitingForAuction = this.props.isWaitingForAuction
    const notWaitingForAuction = !props.isWaitingForAuction

    if (notWaitingForAuction && wasWaitingForAuction) {
      push(`/${match.params.room}/auction`)
    }
  }

  shouldComponentUpdate({ currentPlayer, hasError }, { inAuction }) {
    return this.props.currentPlayer !== currentPlayer ||
           this.props.hasError !== hasError ||
           this.state.inAuction !== inAuction
  }

  render() {
    const {
      hasError,
      currentPlayer,
    } = this.props

    const {
      inAuction
    } = this.state

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
             <Route path={`${path}/auction`} exact render={() => <Auction/>}/>
             <Route render={() => <Redirect to={url}/>}/>
           </Switch>
         ) : (
           <Switch>
             <Route path={path} exact render={() => <JoinGame/>}/>
             <Route render={() => <Redirect to={url}/>}/>
           </Switch>
         )}

        {!inAuction && (
           <Toaster/>
         )}
      </Flex>
    )
  }
}

export default Game
