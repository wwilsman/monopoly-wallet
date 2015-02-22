var express = require('express');

var app     = express();
var server  = app.listen(process.env.PORT || 8080);

var io      = require('socket.io').listen(server).of('/game');
var mio     = require('./lib/monopoly-io')(io);

var mongo   = require('mongodb');
var mserver = new mongo.Server('localhost', 27017, { auto_reconnect: true });
var db      = new mongo.Db('monopoly', mserver);

// Configuration

//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'hbs');

//app.use(express.static(__dirname + '/public'));
app.use(require('cookie-parser')());
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));


// Routes

app.use('/', require('./routes')(db));


// Events

io.on('connection', function(socket) {

  socket.on('join', function(gameId) {
    mio.init(gameId, socket);
  });

});
