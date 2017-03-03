import { Router } from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import fs from 'fs'

import { randomString, loadJSON, deepExtend } from './helpers'
import { createState } from './game'

const router = Router()

// Parser
router.use(bodyParser.json())

// Get a list of available themes
router.get('/themes', (req, res) => {
  const themeDir = './public/themes'

  const themes = fs.readdirSync(themeDir).reduce((arr, theme) => {
    const config = loadJSON(path.join(themeDir, theme, 'config.json'))

    if (config) {
      const { themeName:name, themeDescr:descr } = config
      arr.push({ theme, name, descr })
    }

    return arr
  }, [])

  return res.json({ themes })
})

// New Game
router.post('/new', function(req, res, next) {
  const games = req.app.locals.db.collection('games')
  
  const body = { theme: 'classic', ...req.body }
  const themeDir = path.join('./public/themes/', body.theme)
  
  let config = loadJSON(path.join(themeDir, 'config.json'))
  
  if (!config) {
    return res.status(404).send({
      error: 'Not Found',
      message: 'Theme not found'
    })
  }

  // override defaults
  deepExtend(config, body)

  // Game setup
  const game = {
    config,
    state: createState(config,
      loadJSON(path.join(themeDir, 'properties.json')) || []
    )
  }

  let room = randomString().toUpperCase()

  // save the new game
  games.findOne({ _id: room }, function createGame(err, doc) {
    if (err) return next(err)

    // Try again
    if (doc) {
      room = randomString().toUpperCase();
      return games.findOne({ _id: room }, createGame)
    }

    // Insert the game and respond
    games.insert({ _id: room, ...game }, (err) => {
      if (err) next(err)
      res.json({ room })
    })
  })
})

// Export the router
export default router
