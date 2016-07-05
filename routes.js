var _      = require('./app/helpers');
var config = require('./config');
var router = require('express').Router();
var path   = require('path');
var games;

var urlencodedParser = require('body-parser').urlencoded({ extended: true });
var MonopolyGame     = require('./app/game');

// Static Routes
// -------------

// **New Game**
router.route('/new')

  // Create a new game
  .post(urlencodedParser, function(req, res, next) {

    // Fix values & set defaults
    let body = _.extend({ theme: 'classic' },
      _.fixNumberStrings(req.body || {}));

    // Theme directory
    let themeDir = path.join('./app/themes/', body.theme);

    // Default player
    if (!body.players || !body.players[0]) {
      let token = getFileNames(path.join(themedir, 'tokens'))[0];
      body.players = [{ name: 'Player 1', token }];
    }

    // Game configuration file
    let config = _.loadJSONFile(path.join(themeDir, 'config.json'));

    if (!config) {
      config = _.loadJSONFile('./app/themes/classic/config.json');
      themeDir = './app/themes/classic/';
      body.theme = 'classic';
    }

    // Game setup
    let gameConfig = _.extend(config, body);

    // Load properties & assets
    var propsFile = path.join(themeDir, 'properties.json');
    gameConfig.properties = _.loadJSONFile(propsFile) || [];

    var assetsFile = path.join(themeDir, 'assets.json');
    gameConfig.assets = _.loadJSONFile(assetsFile) || [];

    // Generate a unique ID for the game
    generateGameID(function(err, gameID) {

      // Error
      if (err) {
        return next(err);
      }

      let game = new MonopolyGame(gameConfig);
      game._id = gameID;

      // Insert the game and respond
      games.insert(game.toJSON(), function(err, result) {

        // Error
        if (err) {
          return next(err);
        }

        // Send result
        res.send(result);
      });
    });
  });

// Dynamic Routes
// --------------

// **Find Game**
router.param('gid', function(req, res, next, gid) {

  // Look up the game by id
  games.findOne({ _id: gid }, function(err, doc) {

    // No error but no game found
    if (!err && !doc) {
      err = new Error('unknown game "' + gid + '"');
    }

    // Error
    if (err) {
      return next(err);
    }

    // Make the game available
    req.game = doc;

    // continue
    next();
  });
});

// **Theme Files**
router.route('/:gid/theme/:file')

  // Direct all requests to proper directory
  .get(function(req, res) {
    res.sendFile(req.params.file, {
      root: path.join(__dirname, '/themes/', req.game.theme)
    });
  });


// Functions
// ---------

// Generates a unique game ID
function generateGameID(callback, length) {
  let gameID = _.randID(length);

  games.findOne({ _id: gameID }, function(err, doc) {

    // Error
    if (err) {
      return callback(err);
    }

    // ID not in use
    if (!doc) {
      return callback(null, gameID);
    }

    // Try again
    generateGameID(callback, length);
  });
}

// Get filenames in a directory
getFileNames(dir) {
  return fs.readdirSync(dir).map((f) => path.basename(f, path.extname(f)));
}

// Export a function to access the database
module.exports = function(db) {
  games = db.collection('games');

  return router;
};
