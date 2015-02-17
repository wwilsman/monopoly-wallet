var express = require('express');

var app     = express();

var server  = app.listen(process.env.PORT || 8080);
var io      = require('socket.io').listen(server);


// Configuration

//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'hbs');

//app.use(express.static(__dirname + '/public'));


// Routes

app.get('/', function(req, res) {
  res.send('monopoly server');
});
