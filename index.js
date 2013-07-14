/**
 * Module Dependencies
 */

var Emitter = require('emitter-component');
var pool = require('./lib/pool')();
var slice = [].slice;

/**
 * Export `IO`
 */

module.exports = IO;

/**
 * Mixin `Emitter` on static IO
 */

Emitter(IO);

/**
 * Overwrite IO.emit
 */

IO.emit = function(event, message, socket) {
  var listeners = IO.listeners(event);
  for(var i = 0, listener; listener = listeners[i]; i++) {
    listener.apply(socket, message);
  }
};

/**
 * Clients
 */

var clients = [];

/**
 * Initialize `IO`
 */

function IO(socket, channel) {
  if (!(this instanceof IO)) return new IO(socket, channel);
  this.socket = socket;
  this.$channel = channel;

  var req = socket.transport.request;
  var path = this.path = req.query.pathname;

  // if we already have socket, return immediately
  if (~clients.indexOf(socket)) return;

  if (path) pool.push(path, socket);
  clients.push(socket);

  // handle incoming messages
  socket.on('message', this.message.bind(this));

  // cleanup
  socket.on('close', function() {
    pool.remove(path, socket);
    var i = clients.indexOf(socket);
    if (~i) clients.splice(i, 1);
  });
}

/**
 * Called when a message is recieved
 *
 * @param {Object} message
 * @return {IO}
 */

IO.prototype.message = function(message) {
  var json = JSON.parse(message);
  var event = json.$event;
  if (!event) return this;
  var message = json.$message;
  var channel = json.$channel;

  // create new socket from channel if specified
  var socket = (channel) ? this.channel(channel) : this;

  if (IO.hasListeners(event)) {
    IO.emit(event, message, socket);
  } else {
    socket.broadcast(json);
  }
};

/**
 * Send a message to socket
 */

IO.prototype.emit = function(event) {
  var json = {};
  json.$event = event;
  json.$message = slice.call(arguments, 1);
  if (this.$channel) json.$channel = this.$channel;
  this.broadcast(json);
  return this;
};

/**
 * Broadcast
 */

IO.prototype.broadcast = function(json) {
  var message = JSON.stringify(json);
  var path = this.path;

  // either pull from pool or send to all
  var sockets = (path) ? pool.pull(path) : clients;

  for (var i = 0, socket; socket = sockets[i]; i++) {
    socket.send(message);
  }

  return this;
};

/**
 * Create a channel
 *
 * @api private
 */

IO.prototype.channel = function(channel) {
  return new IO(this.socket, channel);
};
