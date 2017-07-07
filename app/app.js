import React, { Component } from 'react';
import {
  createBrowserHistory,
  createMemoryHistory
} from 'history';
import {
  Redirect,
  Router,
  Route,
  Switch
} from 'react-router-dom';

import './app.css';
import Welcome from './screens/welcome';

class App extends Component {
  history = !this.props.test ?
    createBrowserHistory() :
    createMemoryHistory();

  render() {
    return (
      <Router history={this.history}>
        <Switch>
          <Route path="/" exact component={Welcome}/>
          <Route render={() => <Redirect to="/"/>}/>
        </Switch>
      </Router>
    );
  }
}

export default App;
