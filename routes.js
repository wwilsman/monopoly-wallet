var config = require('./config');
var router = require('express').Router();
var pass   = require('pwd');
var jwt    = require('jsonwebtoken');
var mailer = require('sendgrid')(config.sendgrid.user, config.sendgrid.key);
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
  .post(urlencodedParser, function(req, res, next) {
    var body = req.body || {};

    // Convert all-number strings to floats
    body = fixNumberStrings(body);

    // Game properties
    body.invites = [];
    body.theme = body.theme || 'classic';

    // Load properties based on theme
    //body.properties = loadJSONFile('./public/themes/' +
    //  body.theme + '/properties.json');

    // Create first player's ID
    body.players[0]._id = playerId(body.players[0].name);

    // Generate a unique ID
    generateUID(function(uid) {
      body._id = uid;

      // Insert the game and redirect
      games.insert(body, function(err, result) {

        // Error
        if (err) {
          return next(err);
        }

        // Log player in and redirect to '/:gid/invite'
        var base = '/' + body._id;
        sendPostData(base + '/join', body.players[0], function() {
          res.redirect(201, base + '/invite');
        });
      });
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
  .post(urlencodedParser, function(req, res, next) {

    // Get valid & required fields
    var body = validate(req.body, ['email']);

    // Validation error
    if (body instanceof Error) {
      return next(body);
    }
    
    // Generate token
    var token = jwt.sign(body, config.secret, {
      issuer: req.game._id,
      expiresInMinutes: 60
    });

    // Store the token
    req.game.invites.push(token);
    games.save(req.game, function(err, result) {
      
      // Error
      if (err) {
        return next(err);
      }

      // Send invite
      mailer.send({
        to: body.email,
        from: 'test@example.com',
        subject: 'You were invited to a game of Monopoly',
        text: config.uri + '/' + req.game._id + '/join/?invite=' + token
      }, function(err, message) {
        
        // Error
        if (err) {
          return next(err);
        }

        res.send('success');
      });
    });
  });

// **Join Game**
router.route('/:gid/join')

  // Check if player is invited
  .all(function(req, res, next) {
    var invite = req.query.invite;

    // Token present
    if (invite && req.game.invites.indexOf(invite) > -1) {

      // Verify token
      jwt.verify(invite, config.secret, {
        issuer: req.game._id
      }, function(err, decoded) {

        // Success
        if (!err) {
          req.invited = true;
        }

        next(err);
      });

    // Token not present
    } else {
      next();
    }
  })

  // Show player options
  .get(function(req, res) {
    res.send('/game/join\n' +
      (req.invited ? 'invited: true' : '') +
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

      // Destroy invite
      var inviteIndex = req.game.invites.indexOf(req.query.invite);
      req.game.invites.splice(inviteIndex, 1);

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
function generateUID(length, callback) {
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var uid = '';

  if (typeof length === 'function') {
    callback = length;
    length = null;
  }

  length = length || 5;

  for (var i = 0; i < length; i++) {
    uid += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  games.findOne({ _id: uid }, function(err, doc) {

    // Error
    if (err) {
      throw err;
    }

    // ID not in use
    if (!doc) {
      return callback(uid);
    }

    // Try again
    generateUID(length, callback);
  });
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
    if (!body.hasOwnProperty(required[i])) {
      return new Error('"' + required[i] + '" is a required field');
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

// Convert all-number strings within an object to floats
function fixNumberStrings(obj) {

  // Loop through the object
  for (var key in obj) {

    // Found a string
    if (typeof obj[key] === 'string') {

      // String only contains numbers
      if (obj[key].test(/-?\d+/)) {
        obj[key] = parseFloat(obj[key], 10);
      }

    // Not a string or array, assume it's an object
    } else if (!(obj[key] instanceof Array)) {
      obj[key] = fixNumberStrings(obj[key]);
    }
  }

  return obj;
}

// Return data from a JSON file (not requiring directly to avoid caching)
function loadJSONFile(filename) {
  return JSON.parse(require('fs').readFileSync(filename).toString());
}

// Post **data** to **path**
function sendPostData(path, data, callback) {
  var formdata = [];

  for (var key in data) {
    formdata.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
  }

  formdata = formdata.join('&');

  var req = require('http').request({
    host: config.host,
    port: config.port,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': formdata.length
    }
  }, callback);

  req.write(formdata);
  req.end();
}


// export a function to access the database
module.exports = function(db) {
  games = db.collection('games');

  return router;
};
