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
var mio = require('./lib/monopoly-io')(io);

// Database
var mongo = require('mongoskin');
var db    = mongo.db(config.mongo.uri, {
  server: { auto_reconnect: true }
});


// Configuration
// -------------

//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'hbs');

//app.use(express.static(__dirname + '/public'));

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
    mio.init(gameId, socket);
  });

});
