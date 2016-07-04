// Set Up
// ------

// App
var config  = require('./config');
var express = require('express');
var app     = express();

// Server
var server = app.listen(config.port);

// Webpack
var webpack           = require('webpack');
var webpackMiddleware = require('webpack-dev-middleware');

// Database
var mongo = require('mongoskin');
var db    = mongo.db(config.mongo.uri, {
  server: { auto_reconnect: true }
});

// Sockets
var io = require('socket.io').listen(server).of('/game');
var room = require('./app/game/room')(io, db);

// Misc
var hbs  = require('hbs');
var path = require('path');


// Configuration
// -------------

// HBS
app.set('views', './app/views');
app.set('view engine', 'hbs');

hbs.localsAsTemplateData(app);

// Webpack
if (config.env === 'development') {
  let compiler = webpack(require('./webpack.config.js'));

  app.use(webpackMiddleware(compiler, {
    publicPath: '/public',
    noInfo: true,
  }));
}

// Static folders
app.use(express.static('./public'));

// Sessions
app.use(require('cookie-parser')());
app.use(require('express-session')({
  secret: config.secret,
  resave: false,
  saveUninitialized: true
}));


// Routes
// ------

app.use('/', require('./routes')(db));

// **Unhandled**
app.get('*', function(req, res) {
  res.render('index');
});


// Error Handling
// --------------

app.use(function(err, req, res, next) {
  res.send(err.message);
});


// Events
// ------

io.on('connection', function(socket) {
  socket.on('join', function(gameID, { name = '', token = '' }) {
    room.join(socket, gameID, { name, token });
  });
});
