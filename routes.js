import { randomString, loadJSON, deepExtend } from './lib/helpers'
import config from './config'

import { Router } from 'express'
import bodyParser from 'body-parser'
import path from 'path'

const router = Router()

// Parser
router.use(bodyParser.json())

// Find Game
router.param('gid', function(req, res, next, gid) {
  games.findOne({ _id: gid }, function(err, doc) {
    if (!err && !doc) {
      err = new Error('Unknown game "' + gid + '"')
    }

    if (err) {
      return next(err)
    }

    req.game = doc
    next()
  })
})

// New Game
router.post('/new', function(req, res, next) {
  let body = deepExtend({ theme: 'classic' }, req.body)
  let themeDir = path.join('./public/themes/', body.theme)
  let config = loadJSON(path.join(themeDir, 'config.json'))
  let games = req.app.locals.db.collection('games')

  // Invalid theme
  if (!config) {
    return res.status(404).send({
      title: 'Not Found',
      detail: 'Theme not found'
    })
  }

  // Game setup
  let game = deepExtend(config, body, {
    properties: loadJSON(path.join(themeDir, 'properties.json'))
  })

  let gameID = randomString()

  games.findOne({ _id: gameID }, function createGame(err, doc) {
    if (err) next(err)

    // Try again
    if (doc) {
      gameId = randomString()
      return games.findOne({ _id: gameID }, createGame)
    }

    // Set the ID
    game._id = gameID

    // Insert the game and respond
    games.insert(game, function(err, result) {
      if (err) next(err)
      res.json({ gameID })
    })
  })
})

// Export the router
export default router
