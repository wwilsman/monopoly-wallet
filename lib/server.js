import config from '../config'
import express from 'express'

import mongo from 'mongoskin'

import socketIO from 'socket.io'
import game from './room'

import cookieParser from 'cookie-parser'
import session from 'express-session'

import api from './api'

// App
const app = express()

// Database
const db = mongo.db(config.mongo.uri, {
  server: { auto_reconnect: true }
})

app.locals.db = db
game.db = db

// HBS
app.set('views', './views')
app.set('view engine', 'hbs')

// Webpack
if (config.env === 'development') {
  let compiler = require('webpack')(require('../webpack.config'))

  app.use(require('webpack-dev-middleware')(compiler, {
    publicPath: '/public',
    noInfo: true,
  }))
}

// Static folders
app.use(express.static('./public'))

// Sessions
app.use(cookieParser())
app.use(session({
  secret: config.secret,
  resave: false,
  saveUninitialized: true
}))

// Routes
app.use('/api/', api)

// Unhandled
app.get('*', function(req, res) {
  res.render('index')
})

// Error Handling
app.use(function(err, req, res, next) {
  res.send({ error: err.name, message: err.message })

  if (config.env === 'development') {
    console.log(err)
  }
})

// Server
const server = app.listen(config.port)
console.log('listening on port %s', config.port)

// Sockets
const io = socketIO.listen(server).of('/game')

io.on('connection', function(socket) {
  socket.on('game:join', function(gameID, { name, token }) {
    game.joinRoom(gameID, { socket, name, token })
  })
})
