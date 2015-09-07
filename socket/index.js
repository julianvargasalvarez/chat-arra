var socketIO = require('socket.io');
var socketioJwt = require('socketio-jwt');
var IOredis = require('socket.io-redis');
var User = require('../models/user');
var rtg = require('url').parse(process.env.REDISTOGO_URL);
var redis = require('redis').createClient(rtg.port, rtg.hostname);

function onConnection(socket) {
  redis.set('connections-'+socket.decoded_token.email, socket.id);

  socket.on('general', function(message){
    socket.broadcast.emit('general', { username: socket.decoded_token.email, message: message});
  })
}

function setupIO(http) {
  var io = socketIO(http);
  io.adapter(IOredis(redis));

  io.use(socketioJwt.authorize({
    secret: process.env.SECRET,
    handshake: true
  }));

  io.on('error', logger.error);
  io.on('connection', onConnection);

  return io;
}

module.exports = setupIO;