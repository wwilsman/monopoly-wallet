var express = require('express');
var path = require('path');

module.exports = function(app, io) {
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'hbs');

  app.use(express.static(__dirname + '/public'));

  io.set('log level', 1);
};
