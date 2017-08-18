/* eslint no-console: "off" */
import path from 'path';
import YAML from 'yamljs';
import express from 'express';
import io from 'socket.io';
import { MongoClient } from 'mongodb';

import GameRoom from './room';
import MonopolyError from './error';
import connectSocket from './socket';

// environment specific variables
const ENV = {
  environment: process.env.NODE_ENV || 'development',

  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/monopoly-wallet'
  }
};

// setup express
const app = express();

// static assets
app.use(express.static('public'));

// setup webpack dev middleware
if (ENV.environment === 'development') {
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpackConfig = require('../webpack.config');
  const compiler = webpack(webpackConfig);

  app.use(webpackDevMiddleware(compiler, webpackConfig.devServer));
  app.use(webpackHotMiddleware(compiler));
}

// serve our theme icons
app.use('/icons/:theme.svg', (req, res) => {
  const iconsPath = `./themes/${req.params.theme}/icons.svg`;
  res.sendFile(path.join(__dirname, iconsPath));
});

// all other endpoints render the app
app.use(/\/[^.]*$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// theme loader
const themeCache = {};
GameRoom.set('loader', (theme, file = theme) => {
  if (file === theme) theme = 'classic';
  themeCache[theme] = themeCache[theme] || {};
  themeCache[theme][file] = themeCache[theme][file] ||
    YAML.load(`./server/themes/${theme}/${file}.yml`);
  return themeCache[theme][file];
});

// mongodb persistence
MongoClient.connect(ENV.mongodb.uri).then((db) => {
  const resolveGame = (doc) => new Promise((resolve, reject) => {
    if (!doc) {
      reject(new MonopolyError('Game not found'));
    } else {
      const { _id:id, ...game } = doc;
      resolve({ id, ...game });
    }
  });

  GameRoom.set('database', {
    find: (id) => db.collection('games')
      .findOne({ _id: id }).then(resolveGame),
    save: ({ id, ...game }) => db.collection('games')
      .findOneAndUpdate({ _id: id }, { $set: game }, {
        returnOriginal: false,
        upsert: true
      }).then((doc) => (
        resolveGame(doc.ok && doc.value)
      ))
  });
});

// start the server
const server = app.listen(ENV.port, () => {
  console.log(`Now listening at http://${ENV.host}:${ENV.port}`);
});

// listen for socket connections
io(server).on('connection', connectSocket);
