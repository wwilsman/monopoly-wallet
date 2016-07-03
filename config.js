var config = {};

config.env    = process.env.NODE_ENV || 'development';
config.port   = process.env.PORT || 3000,
config.host   = process.env.HOSTNAME || 'localhost';
config.secret = process.env.SESSION_SECRET || 'monopoly';
config.uri    = 'http://' + config.host + ':' + config.port;

config.mongo = {
  uri: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/monopoly-wallet',
};

module.exports = config;
