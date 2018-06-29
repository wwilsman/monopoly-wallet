/* eslint no-console: "off" */
import path from 'path';
import YAML from 'yamljs';
import express from 'express';
import WebSocket from 'ws';

import GameRoom from './room';
import MonopolyError from './error';
import connectSocket from './socket';

// setup express
const app = express();

// static assets
app.serve = (path) => app.use(express.static(path));
app.serve(path.resolve('./public'));

// serve our theme icons
app.use('/icons/:theme.svg', (req, res) => {
  res.sendFile(path.resolve(`./themes/${req.params.theme}/icons.svg`));
});

// theme loader
const themeCache = {};

GameRoom.set('loader', (theme, file = theme) => {
  if (file === theme) theme = 'classic';
  themeCache[theme] = themeCache[theme] || {};
  themeCache[theme][file] = themeCache[theme][file] ||
    YAML.load(`./themes/${theme}/${file}.yml`);
  return themeCache[theme][file];
});

// sets up mongodb to work with the game room
app.setup = function setup(client) {
  const db = client.db();

  const resolveGame = (doc) => {
    if (!doc) {
      return Promise.reject(new MonopolyError('Game not found'));
    } else {
      let { _id: id, ...game } = doc;
      return Promise.resolve({ id, ...game });
    }
  };

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
};

// starts the http and websocket servers
app.start = function start(host, port) {
  const server = app.listen(port, () => {
    console.log(`Now listening at http://${host}:${port}`);
  });

  const wss = new WebSocket.Server({ server });
  wss.on('connection', connectSocket);
};

// export the extended app
export default app;
