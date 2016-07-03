// Set Up
// ------

// App
var config  = require('./config');
var express = require('express');
var app     = express();

// Server
var server = app.listen(config.port);

// Sockets
var io  = require('socket.io').listen(server).of('/game');

// Database
var mongo = require('mongoskin');
var db    = mongo.db(config.mongo.uri, {
  server: { auto_reconnect: true }
});

// Misc
var hbs  = require('hbs');
var path = require('path');


// Configuration
// -------------

// HBS
app.set('views', path.join(__dirname, '/app/views'));
app.set('view engine', 'hbs');

hbs.localsAsTemplateData(app);

// Static folders
app.use(express.static(path.join(__dirname, '/public')));

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


// Events
// ------

io.on('connection', function(socket) {
  socket.on('join', function(gameId) {

  });
});
