var MonopolyGame = require('./lib/main');
var Provider = require('./provider.js');

module.exports = function(app, io) {

  app.get('/', function(req, res) {
    res.render('index', { title: 'Monopoly' });
  });

  var provider = new Provider;

  app.get('/:id', function(req, res) {
    provider.findById(req.params.id, function(error, config) {
      res.send(config);
    });
  });

};
