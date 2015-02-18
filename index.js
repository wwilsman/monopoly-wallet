var express = require('express');

var app     = express();

var server  = app.listen(process.env.PORT || 8080);
var io      = require('socket.io').listen(server).of('/game');
var mio     = require('./lib/monopoly-io')(io);


// Configuration

//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'hbs');

//app.use(express.static(__dirname + '/public'));


// Routes

app.use('/', require('./routes'));


// Events

io.on('connection', function(socket) {

  socket.on('join', function(gameId) {
    mio.init(gameId, socket);
  });

});
