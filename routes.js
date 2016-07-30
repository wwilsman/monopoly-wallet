import { randID, deepExtend, fixNumberStrings } from './lib/helpers'
import config from './config'

import { Router } from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import fs from 'fs'

const router = Router()
const games

const urlencodedParser = bodyParser.urlencoded({ extended: true })

// Static Routes
// -------------

// **New Game**
router.route('/new')

  // Create a new game
  .post(urlencodedParser, function(req, res, next) {

    // Fix values & set defaults
    let body = deepExtend({ theme: 'classic' },
      fixNumberStrings(req.body || {}))

    // Theme directory
    let themeDir = path.join('./public/themes/', body.theme)

    // Game configuration file
    let config = loadJSONFile(path.join(themeDir, 'config.json'))

    // Invalid theme
    if (!config) {
      return res.status(404).send({
        title: 'Not Found',
        detail: 'Theme not found'
      })
    }

    // Game setup
    let game = deepExtend(config, body)

    // Load properties & assets
    let propsFile = path.join(themeDir, 'properties.json')
    game.properties = loadJSONFile(propsFile) || []

    let assetsFile = path.join(themeDir, 'assets.json')
    game.assets = loadJSONFile(assetsFile) || []

    // Generate a unique ID for the game
    generateGameID(function(err, gameID) {

      // Error
      if (err) {
        return next(err)
      }

      game._id = gameID

      // Insert the game and respond
      games.insert(game, function(err, result) {

        // Error
        if (err) {
          return next(err)
        }

        // Return game ID
        res.json({ gameID: gameID })
      })
    })
  })

// Dynamic Routes
// --------------

// **Find Game**
router.param('gid', function(req, res, next, gid) {

  // Look up the game by id
  games.findOne({ _id: gid }, function(err, doc) {

    // No error but no game found
    if (!err && !doc) {
      err = new Error('unknown game "' + gid + '"')
    }

    // Error
    if (err) {
      return next(err)
    }

    // Make the game available
    req.game = doc

    // continue
    next()
  })
})


// Functions
// ---------

// Generates a unique game ID
function generateGameID(callback, length) {
  let gameID = _.randID(length)

  games.findOne({ _id: gameID }, function(err, doc) {

    // Error
    if (err) {
      return callback(err)
    }

    // ID not in use
    if (!doc) {
      return callback(null, gameID)
    }

    // Try again
    generateGameID(callback, length)
  })
}

// Return data from a JSON file (not requiring directly to avoid caching)
function loadJSONFile(filename) {
  try {
    let read = fs.readFileSync
    return JSON.parse(read(filename).toString())
  } catch (e) {}
}

// Export a function to access the database
export default function(db) {
  games = db.collection('games')

  return router
}
