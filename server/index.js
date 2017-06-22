import express from 'express';
import io from 'socket.io';

// environment specific variables
const ENV = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost'
};

// setup express
const app = express();

// start the server
const server = app.listen(ENV.port, () => {
  console.log(`Now listening at http://${ENV.host}:${ENV.port}`);
});

// websocket setup
io(server).on('connection', (socket) => {
  console.log(`Connected ${socket.id}`);
});
