import config from './config'
import express from 'express'

import webpack from 'webpack'
import webpackMiddleware from 'webpack-dev-middleware'

import mongo from 'mongoskin'

import socket from 'socket.io'
import room from './lib/room'

import hbs from 'hbs'
import path from 'path'

import cookieParse from 'cookie-parser'
import session from 'express-session'

import routes from './routes'


// Set Up
// ------

// App
const app = express()

// Server
const server = app.listen(config.port)

// Database
const db = mongo.db(config.mongo.uri, {
  server: { auto_reconnect: true }
})

// Sockets
const io = socket.listen(server).of('/game')
const gameroom = room(db, io)


// Configuration
// -------------

// HBS
app.set('views', './views')
app.set('view engine', 'hbs')

hbs.localsAsTemplateData(app)

// Webpack
if (config.env === 'development') {
  let compiler = webpack(require('./webpack.config.js'))

  app.use(webpackMiddleware(compiler, {
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
// ------

app.use('/', routes(db))

// **Unhandled**
app.get('*', function(req, res) {
  res.render('index')
})


// Error Handling
// --------------

app.use(function(err, req, res, next) {
  res.send(err.message)
})


// Events
// ------

io.on('connection', function(socket) {
  socket.on('join game', function(gameID, data) {
    gameroom.join(gameID, socket, data)
  })
})
