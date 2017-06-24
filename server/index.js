/* eslint no-console: "off" */
import express from 'express';
import io from 'socket.io';
import { MongoClient } from 'mongodb';

import GameRoom from './room';
import connectSocket from './socket';

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

// mongodb persistence
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

// start the server
const server = app.listen(ENV.port, () => {
  console.log(`Now listening at http://${ENV.host}:${ENV.port}`);
});

// listen for socket connections
io(server).on('connection', connectSocket);
