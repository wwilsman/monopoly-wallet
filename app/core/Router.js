import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ControlledBrowserRouter } from 'react-router-addons-controlled'
import createBrowserHistory from 'history/createBrowserHistory'

import { transitionTo } from './actions'

class Router extends Component {
  state = {}

  componentWillMount() {
    const {
      basename,
      forceRefresh,
      getUserConfirmation,
      keyLength,
      store
    } = this.props

    this.history = createBrowserHistory({
      basename,
      forceRefresh,
      getUserConfirmation,
      keyLength
    })

    this._updateHistory()
  }

  componentWillReceiveProps(props) {
    this._updateHistory(props.location, props.action)
  }

  _updateHistory(
    location = this.history.location,
    action = this.history.action
  ) {
    if (!this.props.location && !this.props.action) {
      this.props.transitionTo(location, action)
    }

    this.setState({ location, action })
  }

  syncHistory = (location, action) => {
    if (action === 'SYNC') {
      this.props.transitionTo(location, this.props.action)
    } else  {
      this.props.transitionTo(location, action)
    }
  }

  render() {
    const {
      basename,
      forceRefresh,
      getUserConfirmation,
      keyLength,
      store,
      location,
      action,
      ...routerProps
    } = this.props

    return (
      <ControlledBrowserRouter
        history={this.history}
        location={this.state.location}
        action={this.state.action}
        onChange={this.syncHistory}
        {...routerProps}
      />
    )
  }
}

function mapStateToProps(state) {
  return {
    location: state.routing.location,
    action: state.routing.action
  }
}

const RouterContainer = connect(
  mapStateToProps, {
    transitionTo
  }
)(Router)

export default RouterContainer
