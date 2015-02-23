var router = require('express').Router();
var pass   = require('pwd');
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

    // Error
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
    if (!req.session.auth) {
      res.redirect(401, '/' + req.params.gid);
    }

    next();
  })

  // Show invitee options
  .get(function(req, res) {
    res.send('/game/invite\n' +
      'gid: ' + req.params.gid);
  })

  // Send email to invitee
  .post(function(req, res) {
    res.send('success');
  });

// **Join Game**
router.route('/:gid/join')

  // Player is invited
  .all(function(req, res, next) {
    //if (/* check query for token */) {
      //req.invited = true;
    //}

    next();
  })

  // Show player options
  .get(function(req, res) {
    res.send('/game/join\n' +
      'gid: ' + req.params.gid);
  })

  // Log player in
  .post(urlencodedParser, function(req, res, next) {

    // Create player if invited
    if (req.invited) {
      return next();
    }

    // Get valid & required fields
    var body = validate(req.body, ['name', 'password']);

    // Validation error
    if (body instanceof Error) {
      return next(body);
    }

    // Get player
    var player = getPlayer(req.game, playerId(body.name));

    if (!player) {
      return next(new Error('unknown player: "' + body.name + '"'))
    }

    // Hash the password with the player's salt
    pass.hash(info.password, player.salt, function(err, hash) {

      // No errors, but hash doesn't match
      if (!err && player.hash !== hash) {
        err = new Error('invalid password');
      }

      // Error
      if (err) {
        throw err;
      }

      // Authenticate session and redirect
      req.session.auth = true;
      res.redirect('/' + req.game._id + '/' + player._id);
    });
    
  // Create player
  }, function(req, res, next) {
    
    // Get valid & required fields
    var body = validate(req.body,
      ['name', 'token', 'password'],
      {
        'token': function(value) {
          return !req.game.players.filter(function(p) {
            return p.token === value;
          }).length;
        }
      });

    // Validation error
    if (body instanceof Error) {
      return next(body);
    }

    // Generate a hash from the password
    pass.hash(body.password, function(err, salt, hash) {

      // Delete the original password
      delete body.password;

      if (err) {
        return next(err);
      }

      // Additional data for the player
      body._id = playerId(body.name);
      body.salt = salt;
      body.hash = hash;

      // Add player to the game
      req.game.players.push(body);

      // Save the game
      games.save(req.game, function(err, result) {
        res.send('success');
      });
    });
  });

// **Find Player**
router.param('pid', function(req, res, next, pid) {

  // Assume there is an associated game
  var player = getPlayer(req.game, pid);

  // Error
  if (!player) {
   return next(new Error('unknown player "' + pid + '"'));
  }

  // Make the player available
  req.player = player;

  next();
});

// **Player Overview/Dashboard**
router.route('/:gid/:pid')

  // Show player overview/dashboard
  .get(function(req, res) {

    // Player is authenticated
    if (req.session.auth) {

      // Render dashboard
      res.send(req.game);
    }

    // Render overview
    res.send('/game/player\n' +
      'gid: ' + req.params.gid + '\n' +
      'pid: ' + req.params.pid);
  });


// Error Handling
// --------------

// **Unhandled**
router.get('*', function(req, res, next) {
  next(new Error(404));
});

// **Error**
router.use(function(err, req, res, next) {
  res.send(err.message);
});


// Helper functions
// ----------------

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

// Get player from game by id
function getPlayer(game, id) {
  return game.players.filter(function(p) {
    return p._id === id;
  })[0];
}

// Generate a player id from their name
function playerId(pName) {
  return pName.toLowerCase().replace(' ', '-');
}

// Check the **body** object for required and validated fields
function validate(body, required, validations) {

  // Assume required is an object if not an array
  if (!(required instanceof Array)) {
    validations = required;
    required = [];
  }

  // Default params
  body = body || {};
  validations = validations || {};

  // Check for required fields
  for (var i = 0, l = required.length; i < l; i++) {
    if (!body.hasOwnProperty(reqiured[i])) {
      return new Error(`"${required[i]}" is a required field`);
    }
  }

  // Check against **validations**
  for (var param in body) {
    var value = body[param];

    if (validations.hasOwnProperty(param)) {
      var valid = validations[param];

      if (valid instanceof RegExp) {
        if (!value.test(valid)) {
          return new Error('"' + param + '" doesn\'t match expected');
        }
      } else if (typeof valid === "function") {
        if (!valid(value, param)) {
          return new Error('"' + param + '" doesn\'t match expected');
        }
      }
    }
  }

  return body;
}


// export a function to access the database
module.exports = function(db) {
  db.open(function(err, d) {
    games = d.collection('games');
  });

  return router;
};
