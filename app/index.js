import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';

window.socket = io('/game');

ReactDOM.render(
  <h1>Hello Monopoly!</h1>,
  document.getElementById('root')
);

// @TODO: at least be able create/join a game
