import { randomString, loadJSON, deepExtend } from './helpers'
import config from '../config'

import { Router } from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import fs from 'fs'

const router = Router()

// Parser
router.use(bodyParser.json())

// Get a list of available themes
router.get('/themes', (req, res) => {
  let themeDir = './public/themes'

  let themes = fs.readdirSync(themeDir).reduce((arr, file) => {
    const theme = loadJSON(path.join(themeDir, file, 'theme.json'))

    if (theme) {
      arr.push({ ...theme, _id: file })
    }

    return arr
  }, [])

  return res.json({ themes })
})

// Get info about a game
router.get('/info', (req, res, next) => {
  let games = req.app.locals.db.collection('games')
  let gid = req.query.game

  games.findOne({ _id: gid }, function(err, game) {
    if (!err && !game) {
      err = new Error('Unknown game "' + gid + '"')
    }

    if (err) {
      return next(err)
    }

    let themeDir = path.join('./public/themes/', game.theme)
    let theme = loadJSON(path.join(themeDir, 'theme.json')) || {}
    let glyphs = loadJSON(path.join(themeDir, 'icons/glyphs.json')) || {}

    res.json({ game,
      theme: { ...theme,
        _id: game.theme,
        glyphs
      }
    })
  })
})

// New Game
router.post('/new', function(req, res, next) {
  let body = deepExtend({ theme: 'classic' }, req.body)
  let themeDir = path.join('./public/themes/', body.theme)
  let config = loadJSON(path.join(themeDir, 'config.json'))
  let games = req.app.locals.db.collection('games')

  if (!config) {
    return res.status(404).send({
      title: 'Not Found',
      detail: 'Theme not found'
    })
  }

  // Game setup
  let game = deepExtend(config, body, {
    properties: loadJSON(path.join(themeDir, 'properties.json')) || {}
  })

  let gameID = randomString()

  games.findOne({ _id: gameID }, function createGame(err, doc) {
    if (err) next(err)

    // Try again
    if (doc) {
      gameID = randomString()
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
