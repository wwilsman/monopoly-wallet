var router = require('express').Router();

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
  .post(function(req, res) {
    res.redirect('/game');
  });


// Dynamic Routes
// --------------

// **Find Game**
router.param('gid', function(req, res, next, gid) {  

  // Look up the game by id
  //db.findById(req.params.gid, function(err, doc) {
  //
  //  // No error but no game found
  //  if (!err && !doc) {
  //    err = new Error('unknown game "' + gid + '"');
  //  }
  //  
  //  // 404
  //  if (err) {
  //    return next(err);
  //  }
  //  
  //  // Make the game available
  //  req.game = doc;
    next();
  //});
});

// **Game Overview**
router.route('/:gid')

  // Show the game overview
  .get(function(req, res) {
    res.send('/game<br><br>' + 
      'gid: ' + req.params.gid);
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


module.exports = router;
