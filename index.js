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

// Misc
var hbs  = require('hbs');
var sass = require('node-sass-middleware');


// Configuration
// -------------

// HBS
app.set('views', __dirname + '/app/views');
app.set('view engine', 'hbs');

hbs.localsAsTemplateData(app);

// Sass
app.use(sass({
  src: __dirname + '/app',
  dest: __dirname + '/app/public'
}));

// Static folders
app.use(express.static(__dirname + '/public'));

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
