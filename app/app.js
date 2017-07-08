import React, { Component } from 'react';
import { Provider } from 'react-redux';
import {
  createBrowserHistory,
  createMemoryHistory
} from 'history';
import {
  Redirect,
  Route,
  Switch
} from 'react-router-dom';
import {
  ConnectedRouter
} from 'react-router-redux';

import './app.css';
import createStore from './store';
import Welcome from './screens/welcome';

class App extends Component {
  history = !this.props.test ?
    createBrowserHistory() :
    createMemoryHistory();

  store = createStore({
    history: this.history
  });

  render() {
    return (
      <Provider store={this.store}>
        <ConnectedRouter history={this.history}>
          <Switch>
            <Route path="/" exact component={Welcome}/>
            <Route render={() => <Redirect to="/"/>}/>
          </Switch>
        </ConnectedRouter>
      </Provider>
    );
  }
}

export default App;
