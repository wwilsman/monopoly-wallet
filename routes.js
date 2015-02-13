var MonopolyGame = require('./lib/main');
var M = new MonopolyGame(JSON.parse(require('fs').readFileSync('example.json')));

module.exports = function(app, io) {

  app.get('/', function(req, res) {
    res.render('index', { title: 'Monopoly', test: M.id });
  });

  app.get('/:id', function(req, res) {
    res.send(MonopolyGame.get(req.params.id));
  });
};
