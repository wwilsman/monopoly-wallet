var MonopolyGame = require('./lib/main');

var Mongo = require('mongodb');
var dbserver = new Mongo.Server('localhost', 27017, { auto_reconnect: true }, {});
var db = new Mongo.Db('monopoly', dbserver);

module.exports = function(app, io) {

  app.get('/', function(req, res) {
    res.render('index', { title: 'Monopoly' });
  });

  db.open(function(){});
  var games = db.collection('games');

  app.post('/new', function(req, res) {
    var game = new MonopolyGame(req.params.config)
    games.insert(game, function(error, doc) {
      res.redirect('/' + game._id);
    });
  });

  app.get('/:_id', function(req, res) {
    games.findOne(req.params, function(error, doc) {
      res.send(doc);
    });
  });

};
