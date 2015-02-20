var router = require('express').Router();
var games;

var urlencodedParser = require('body-parser').urlencoded({ extended: true });

// Static Routes
// -------------

// **Index**
router.route('/')

  // Show the index
  .get(function(req, res) {
    res.send('/index');
  });

// **New Game**
router.route('/new')

  // Show game options
  .get(function(req, res) {
    res.send('/new');
  })

  // Create a new game
  .post(urlencodedParser, function(req, res) {
    var config = req.body || {};

    // Fetch properties.json based on theme

    // Unique ID
    config._id = uid();

    // Insert the game and redirect
    games.insert(config, function(err, result) {
      res.redirect(201, '/' + config._id);
    });
  });


// Dynamic Routes
// --------------

// **Find Game**
router.param('gid', function(req, res, next, gid) {  

  // Look up the game by id
  games.findOne({ _id: req.params.gid }, function(err, doc) {

    // No error but no game found
    if (!err && !doc) {
      err = new Error('unknown game "' + gid + '"');
    }

    // 404
    if (err) {
      return next(err);
    }

    // Make the game available
    req.game = doc;
    next();
  });
});

// **Game Overview**
router.route('/:gid')

  // Show the game overview
  .get(function(req, res) {
    res.send(req.game);
  });

// **Invite Player**
router.route('/:gid/invite')

  // Redirect unauthenticated player
  .all(function(req, res, next) {

    // Player is not authenticated
    //if (/* authentication check */) {
      res.redirect('/' + req.params.gid);
    //}
  })

  // Show invitee options
  .get(function(req, res) {
    res.send('/game/invite<br><br>' + 
      'gid: ' + req.params.gid);
  })

  // Send email to invitee
  .post(function(req, res) {
    res.send('success');
  });

// **Join Game**
router.route('/:gid/join')

  // Redirect uninvited player
  .all(function(req, res, next) {

    // Player is not invited
    //if (/* check query for token */) {
      res.redirect('/' + req.params.gid);
    //}
  })

  // Show player options
  .get(function(req, res) {
    res.send('/game/join<br><br>' + 
      'gid: ' + req.params.gid);
  })

  // Create new player
  .post(function(req, res) {
    res.send('success');
  });

// **Find Player**
router.param('pid', function(req, res, next, pid) {  

  // Assume there is an associated game
  // var player = req.game.players.filter(function(p) {
  //   return p.id === pid;
  // })[0];

  // 404
  //if (!player) {
  //  return next(new Error('unknown player "' + pid + '"'));
  //}

  // Make the player available
  //req.player = player

  // Authentication
  //if (/* authentication check */) {
    //req.authenticated = true;
  //}

  next();
});

// **Player Overview/Dashboard**
router.route('/:gid/:pid')

  // Show player overview/dashboard
  .get(function(req, res) {

    // Player is not authenticated
    if (!req.authenticated) {

      // Render overview
    }

    // Render dashboard
    res.send('/game/player<br><br>' +
      'gid: ' + req.params.gid + '<br>' +
      'pid: ' + req.params.pid);
  });

// **Player's Account**
router.route('/:gid/:pid/account')

  // Show player's account
  .get(function(req, res) {

    // Player is not authenticated
    if (!req.authenticated) {
      res.redirect('/' + req.params.gid + '/' + req.params.pid);
    }

    // Render account
  });


// Error Handling
// ---

// **Unhandled**
router.get('*', function(req, res, next) {
  next(new Error('nothing here'));
});

// **Error**
router.use(function(err, req, res, next) {
  res.status(404);
  res.send(err.message);
});


// Create a Unique ID not already in the database
function uid(length) {
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var id = '';

  length = length || 5;

  for (var i = 0; i < length; i++) {
    id += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  if (games.find({ _id: id }).count()) {
    id = uid(length);
  }

  return id;
}

// export a function to access the database
module.exports = function(db) {
  db.open(function(err, d) {
    games = d.collection('games');
  });

  return router;
};
