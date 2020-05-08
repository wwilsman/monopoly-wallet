/* eslint no-console: "off" */
const path = require('path');
const express = require('express');
const { MongoClient } = require('mongodb');
const WebSocket = require('ws');
const YAML = require('yamljs');

// env vars and defaults
const {
  NODE_ENV: ENV = 'development',
  PORT = 3000,
  HOST = 'localhost',
  MONGODB_URI = 'mongodb://localhost:27017/monopoly-wallet'
} = process.env;

// setup express app
const app = express();
app.use(express.static(path.resolve('./public')));

// serve our theme icons
app.use('/icons/:theme.svg', (req, res) => {
  res.sendFile(path.resolve(`./themes/${req.params.theme}/icons.svg`));
});

// setup webpack dev middleware
if (ENV === 'development') {
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
const server = app.listen(PORT, () => {
  console.log(`Now listening at http://${HOST}:${PORT}`);
});

// setup the game room
const GameRoom = require(ENV === 'development' ? './src' : './dist').default;
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
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(client => {
    let db = client.db().collection('games');
    let resolveGame = ({ _id, ...game } = {}) => !_id
      ? Promise.reject(new Error('Game not found'))
      : Promise.resolve(game);

    grm.use({
      loadGame: _id => db.findOne({ _id }).then(resolveGame),
      saveGame: game => db.findOneAndUpdate(
        { _id: game.room }, { $set: game }, { returnOriginal: false, upsert: true }
      ).then(doc => resolveGame(doc.ok && doc.value))
    });
  })
  .catch(err => {
    console.log('Unable to connect to mongodb: %s', err.name);
  });

// create a game with a specific scenario for development
if (ENV === 'development') {
  require('./test/index'); // sets up env for mock helper
  const { mockGame } = require('./test/helpers/mock-server');

  mockGame.call(grm, {
    room: 't35tt',
    players: [{
      token: 'top-hat',
      name: 'PLAYER 1'
    }, {
      token: 'automobile',
      name: 'PLAYER 2'
    }, {
      token: 'scottish-terrier',
      name: 'PLAYER 3'
    }, {
      token: 'battleship',
      name: 'PLAYER 4'
    }],
    properties: [
      { id: 'baltic-avenue', owner: 'top-hat', mortgaged: true },
      { id: 'oriental-avenue', owner: 'automobile' },
      { id: 'vermont-avenue', owner: 'automobile' },
      { group: 'orange', owner: 'top-hat', monopoly: true, buildings: 4 },
      { id: 'new-york-avenue', buildings: 5 },
      { id: 'indiana-avenue', owner: 'automobile' },
      { id: 'atlantic-avenue', owner: 'scottish-terrier' },
      { id: 'ventnor-avenue', owner: 'scottish-terrier' },
      { id: 'boardwalk', owner: 'top-hat' },
      { id: 'reading-railroad', owner: 'top-hat' },
      { id: 'pennsylvania-railroad', owner: 'top-hat' },
      { id: 'electric-company', owner: 'top-hat' },
      { id: 'water-works', owner: 'scottish-terrier' }
    ],
    notice: { message: 'PLAYER 1 did something', meta: { player: 'top-hat' } },
    history: [
      { notice: { message: 'PLAYER 2 did something', meta: { player: 'automobile' } } },
      { notice: { message: 'PLAYER 1 did something', meta: { player: 'top-hat' } } },
      { notice: { message: 'PLAYER 3 did something', meta: { player: 'scottish-terrier' } } },
      { notice: { message: 'PLAYER 4 did something', meta: { player: 'battleship' } } },
      { notice: { message: 'PLAYER 2 did something', meta: { player: 'automobile' } } },
      { notice: { message: 'PLAYER 1 did something', meta: { player: 'top-hat' } } }
    ]
  });
}
