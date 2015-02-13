var MonopolyGame = require('./lib/main');

module.exports = function(app, io) {

  app.get('/', function(req, res) {
    res.render('index', { title: 'Monopoly' });
  });
  
};
