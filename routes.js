var _      = require('./lib/helpers');
var path   = require('path');
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
    body = _.fixNumberStrings(body);

    // Game properties
    body.invites = [];
    body.theme = body.theme || 'classic';

    var themedir = path.join('./app/themes/', body.theme);

    // Game config
    body = _.extend(_.loadJSONFile(path.join(themedir, 'config.json')) || {}, body);

    // Load properties based on theme
    body.properties = _.loadJSONFile(path.join(themedir, 'properties.json')) || [];

    // Generate a unique ID for the game
    _.generateUID(games, function(err, uid) {

      // Error
      if (err) {
        return next(err);
      }

      body._id = uid;

      var player = body.players[0];

      // Set up the first player
      pass.hash(player.password, function(err, salt, hash) {

        // Delete the original password
        delete player.password;

        // Error
        if (err) {
          return next(err);
        }

        // Additional data for the player
        player._id = _.dasherize(player.name);
        player.salt = salt;
        player.hash = hash;

        // Insert the game and redirect
        games.insert(body, function(err, result) {

          // Error
          if (err) {
            return next(err);
          }

          // Authenticate and redirect to '/:gid/invite'
          req.session.gid = body._id;
          req.session.pid = player._id;
          res.redirect(201, '/' + body._id + '/invite');
        });
      });
    });
  });

// **List Themes**
router.route('/themes')

  // Send an array of theme names
  .get(function(req, res, next) {
    require('fs').readdir('./app/themes/', function(err, files) {

      // Error
      if (err) {
        return next(err);
      }

      res.send(files);
    });
  });

// **List Theme Tokens**
router.route('/themes/:theme/tokens')

  // Send an array of token filenames
  .get(function(req, res, next) {
    require('fs').readdir(
      path.join('./app/themes/', req.params.theme, '/tokens'),
      function(err, files) {

        // Error
        if (err) {
          return next(err);
        }

        res.send(files);
      }
    );
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

    // Determine if player is authorized
    res.locals.authenticated = req.session.gid === gid;

    // Define helpful locals
    res.locals.gid = gid;
    res.locals.theme = doc.theme;

    // continue
    next();
  });
});

// **Game Overview**
router.route('/:gid')

  // Show the game overview
  .get(function(req, res) {
    res.send(req.game);
  });

// **Theme Files**
router.route('/:gid/theme/:file')

  // Direct all requests to proper directory
  .get(function(req, res) {
    res.sendFile(req.params.file, {
      root: path.join(__dirname, '/app/themes/', req.game.theme)
    });
  });

// **Invite Player**
router.route('/:gid/invite')

  // Redirect unauthenticated player
  .all(function(req, res, next) {

    // Player is not authenticated
    if (!res.locals.authenticated) {
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
    var body = _.validate(req.body, ['email']);

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
          res.locals.invited = true;
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
      (res.locals.invited ? 'invited: true' : '') +
      'gid: ' + req.params.gid);
  })

  // Log player in
  .post(urlencodedParser, function(req, res, next) {

    // Create player if invited
    if (res.locals.invited) {
      return next();
    }

    // Get valid & required fields
    var body = _.validate(req.body, ['name', 'password']);

    // Validation error
    if (body instanceof Error) {
      return next(body);
    }

    // Get player
    var player = req.game.players.filter(function(p) {
      return p.name.toLowerCase() === body.name.toLowerCase();
    })[0];

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
        return next(err);
      }

      // Set session variables and redirect
      req.session.gid = req.game._id;
      req.session.pid = player._id;
      res.redirect('/' + req.game._id + '/' + player._id);
    });
    
  // Create player
  }, function(req, res, next) {
    
    // Get valid & required fields
    var body = _.validate(req.body,
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
      body._id = _.dasherize(body.name);
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
  var player = req.game.players.filter(function(p) {
    return p._id === pid;
  })[0];

  // Error
  if (!player) {
   return next(new Error('unknown player "' + pid + '"'));
  }

  // Make the player available
  req.player = player;

  // Determine if player is authorized
  if (res.locals.authenticated) {
    res.locals.authenticated = req.session.pid === pid;
  }

  // Define helpful local
  res.locals.pid = pid;

  // continue
  next();
});

// **Player Overview/Dashboard**
router.route('/:gid/:pid')

  // Show player overview/dashboard
  .get(function(req, res) {

    // Player is authenticated
    if (res.locals.authenticated) {

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


// export a function to access the database
module.exports = function(db) {
  games = db.collection('games');

  return router;
};
