import config from './config'
import express from 'express'

import mongo from 'mongoskin'

import socketIO from 'socket.io'
import room from './lib/room'

import cookieParser from 'cookie-parser'
import session from 'express-session'

import routes from './routes'

// App
const app = express()

// Database
const db = mongo.db(config.mongo.uri, {
  server: { auto_reconnect: true }
})

app.locals.db = db

// HBS
app.set('views', './views')
app.set('view engine', 'hbs')

// Webpack
if (config.env === 'development') {
  let compiler = require('webpack')(require('./webpack.config'))

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
app.use('/', routes)

// **Unhandled**
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
  socket.on('join game', function(gameID, data) {
    db.collection('games').findOne({ _id: gameID }, (err, game) => {
      if (err || !game) {
        return socket.emit('notice', {
          type: 'error',
          message: err ? err.message : 'Game not found'
        })
      }

      room.joinRoom(game, socket, data)
    })
  })
})
