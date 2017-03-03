import React, { Component, PropTypes } from 'react'
import { Route, Switch, Redirect } from 'react-router'

import { Toaster } from '../../toaster'

import {
  JoinGame,
  Player,
  Search,
  Errored
} from '../'

class Game extends Component {
  static propTypes = {
    connectGame: PropTypes.func.isRequired,
    currentPlayer: PropTypes.object,
    hasError: PropTypes.bool,
    room: PropTypes.string
  }

  static contextTypes = {
    router: PropTypes.shape({
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
    const {
      match: { params }
    } = this.context.router

    if (!this.props.room) {
      this.props.connectGame(params.room)
    }
  }

  shouldComponentUpdate(props) {
    return this.props.currentPlayer !== props.currentPlayer ||
           this.props.hasError !== props.hasError
  }

  render() {
    const {
      hasError,
      currentPlayer,
    } = this.props

    const {
      match: { path, url }
    } = this.context.router

    return hasError ? (
      <Errored/>
    ) : (
      <div>
        {currentPlayer ? (
           <Switch>
             <Route path={path} exact render={() => <Player/>}/>
             <Route path={`${path}/search`} exact render={() => <Search/>}/>
             <Route render={() => <Redirect to={url}/>}/>
           </Switch>
         ) : (
           <Switch>
             <Route path={path} exact render={() => <JoinGame/>}/>
             <Route render={() => <Redirect to={url}/>}/>
           </Switch>
         )}
        
        <Toaster/>
      </div>
    )
  }
}

export default Game
