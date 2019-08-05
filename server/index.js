/* eslint no-console: "off" */
const path = require('path');
const express = require('express');
const { MongoClient } = require('mongodb');
const WebSocket = require('ws');
const YAML = require('yamljs');

// env vars and defaults
const ENV = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/monopoly-wallet',
    options: { useNewUrlParser: true }
  }
};

// setup express app
const app = express();
app.use(express.static(path.resolve('./public')));

// serve our theme icons
app.use('/icons/:theme.svg', (req, res) => {
  res.sendFile(path.resolve(`./themes/${req.params.theme}/icons.svg`));
});

// setup webpack dev middleware
if (ENV.env === 'development') {
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const compiler = webpack(require('app/webpack.config'));
  const middle = webpackDevMiddleware(compiler, {
    contentBase: path.resolve('./public'),
    publicPath: '/',
    stats: 'minimal'
  });

  app.use(middle);
  app.use(webpackHotMiddleware(compiler));
  app.use(/\/[^.]*$/, middle);

// use built assets
} else {
  app.use(express.static(path.resolve('../app/dist')));

  app.use(/\/[^.]*$/, (req, res) => {
    res.sendFile(path.resolve('../app/dist/index.html'));
  });
}

// start the server
const server = app.listen(ENV.port, () => {
  console.log(`Now listening at http://${ENV.host}:${ENV.port}`);
});

// setup the game room
const GameRoom = require(ENV.env === 'development' ? './src' : './dist').default;
const wss = new WebSocket.Server({ server });
const grm = new GameRoom.Manager({ wss });

// theme loading
grm.use({
  loadTheme: (name, path) => (
    YAML.load(`./themes/${name}/${path}.yml`)
  )
});

// connect mongo
MongoClient
  .connect(ENV.mongodb.uri, ENV.mongodb.options)
  .then(client => {
    let db = client.db().collection('games');
    let resolveGame = ({ _id: id, ...game } = {}) => !id
      ? Promise.reject(new Error('Game not found'))
      : Promise.resolve({ id, ...game });

    grm.use({
      loadGame: _id => db.findOne({ _id }).then(resolveGame),
      saveGame: ({ id: _id, ...game }) => db.findOneAndUpdate(
        { _id }, { $set: game }, { returnOriginal: false, upsert: true }
      ).then(doc => resolveGame(doc.ok && doc.value))
    });
  })
  .catch(err => {
    console.log('Unable to connect to mongodb: %s', err.name);
  });
