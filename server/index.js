/* eslint no-console: "off" */
import express from 'express';
import io from 'socket.io';
import { MongoClient } from 'mongodb';

import GameRoom from './room';

// environment specific variables
const ENV = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/monopoly-wallet'
  }
};

// setup express
const app = express();

// in-memory persistence layer for testing
if (process.env.NODE_ENV === 'testing') {
  const tmp = {};

  GameRoom.persist({
    find: (id) => tmp[id] ? Promise.resolve(tmp[id]) :
      Promise.reject('Game not found'),
    save: (doc) => Promise.resolve(tmp[doc.id] = doc)
  });

// mongodb persistence
} else {
  MongoClient.connect(ENV.mongodb.uri)
    .then((db) => GameRoom.persist({
      find: (id) => db.collection('games')
        .findOne({ _id: id }).then((game) => (
          new Promise((resolve, reject) => (
            game ? resolve(game) : reject('Game not found')
          ))
        )),
      save: (game) => db.collection('games')
        .findOneAndUpdate({ _id: game.id }, { $set: game }, {
          returnOriginal: false,
          upsert: true
        }).then((doc) => new Promise((resolve, reject) => {
          if (!doc.ok) return reject('Game not found');
          // eslint-disable-next-line no-unused-vars
          const { _id, ...game } = doc.value;
          return resolve(game);
        }))
    }));
}

// start the server
const server = app.listen(ENV.port, () => {
  if (process.env.NODE_ENV !== 'testing') {
    console.log(`Now listening at http://${ENV.host}:${ENV.port}`);
  }
});

// websocket setup
io(server).on('connection', (socket) => {
  const errorHandler = (message) => {
    socket.emit('room:error', message);
  };

  /**
   * Creates a new game and emits it's initial state
   * @param {Object} config - Custom game configuration
   */
  socket.on('game:new', (config) => {
    GameRoom.new(config).then((game) => {
      socket.emit('game:created', game);
    }).catch(errorHandler);
  });

  /**
   * Connects to a game room and emits it's state
   * @param {String} gameID - Game room ID
   */
  socket.on('room:connect', (gameID) => {
    GameRoom.connect(gameID).then((room) => {
      socket.emit('room:connected', {
        id: room.id,
        state: room.state,
        config: room.config
      });
    }).catch(errorHandler);
  });
});
