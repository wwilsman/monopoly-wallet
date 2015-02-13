var MonopolyGame = require('./lib/main');

var Mongo = require('mongodb');
var dbserver = new Mongo.Server('localhost', 27017, { auto_reconnect: true }, {});
var db = new Mongo.Db('monopoly', dbserver);

module.exports = function(app, io) {

  // index
  app.get('/', function(req, res) {
    res.render('index', { title: 'Monopoly' });
  });

  // start database connection
  db.open(function(){});
  var games = db.collection('games');

  // create a new game
  app.post('/new', function(req, res) {
    var game = new MonopolyGame(req.params.config)
    games.insert(game, function(error, doc) {
      res.redirect('/' + game._id);
    });
  });

  // getting a game
  app.param('game_id', function(req, res, next, game_id) {
    games.findOne({ _id: game_id }, function(error, doc) {
      if (error) {
        next(error);
      } else if (doc) {
        req.game = doc;
        next();
      } else {
        // 404
        next()
      }
    });
  });

  // showing a game
  app.get('/:game_id', function(req, res) {
    res.send(req.game);
  });

};
