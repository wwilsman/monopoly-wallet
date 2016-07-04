var _ = require('../helpers');
var MonopolyGame = require('./index');
var redux = require('redux');

function reducer(state = {}, action) {
  switch (action.type) {
  default:
    return state
  }
}

class MonopolyRedux {

  constructor() {
    this.store = redux.createStore(reducer);

    this.store.subscribe(() => {
      console.log(this.store.getState());
    });
  }
}

module.exports = MonopolyRedux;
