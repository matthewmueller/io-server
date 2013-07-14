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

IO.emit = function(event, json, socket) {
  var listeners = IO.listeners(event);
  for(var i = 0, listener; listener = listeners[i]; i++) {
    listener.call(socket, json);
  }
};

/**
 * Clients
 */

var clients = [];

/**
 * Initialize `IO`
 */

function IO(socket) {
  if (!(this instanceof IO)) return new IO(socket);
  this.socket = socket;

  var req = socket.transport.request;
  var path = this.path = req.query.pathname;

  if (path) pool.push(path, socket);
  clients.push(socket);

  // handle incoming messages
  socket.on('message', this.message.bind(this));

  // cleanup
  socket.on('close', function() {
    pool.remove(path, socket);
  });
}

/**
 * Called when a message is recieved
 *
 * @param {Object} message
 * @return {IO}
 */

IO.prototype.message = function(message) {
  var self = this;
  var args = slice.call(arguments);
  var json = JSON.parse(message);
  var event = json.event;
  var path = this.path;
  if (!event) return this;

  if (IO.hasListeners(event)) {
    IO.emit(event, json, this);
  } else {
    this.broadcast(json);
  }
};

/**
 * Send a message to socket
 */

IO.prototype.emit = function(event, json) {
  json = json || {};
  json.event = event;
  this.broadcast(json);
  return this;
};

/**
 * Broadcast
 */

IO.prototype.broadcast = function(json) {
  var path = this.path;
  var message = JSON.stringify(json);

  // either pull from pool or send to all
  var sockets = (path) ? pool.pull(path) : clients;

  for (var i = 0, socket; socket = sockets[i]; i++) {
    socket.send(message);
  }

  return this;
};
