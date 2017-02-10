import React, { Component, PropTypes } from 'react'
import { Route, Switch, Redirect } from 'react-router'

import { Toaster } from '../../toaster'

import {
  JoinGame,
  Errored
} from '../'

class Game extends Component {
  static propTypes = {
    fetchGameInfo: PropTypes.func.isRequired,
    currentPlayer: PropTypes.object,
    hasError: PropTypes.bool,
    hasInfo: PropTypes.bool
  }

  static contextTypes = {
    router: PropTypes.shape({
      match: PropTypes.shape({
        url: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
        params: PropTypes.shape({
          gameID: PropTypes.string.isRequired
        }).isRequired
      }).isRequired
    }).isRequired
  }

  componentWillMount() {
    const {
      hasInfo,
      fetchGameInfo,
    } = this.props

    const {
      match: { params }
    } = this.context.router

    if (!hasInfo) {
      fetchGameInfo(params.gameID)
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
