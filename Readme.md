
# IO-server

  IO-server for use with [io](http://github.com/matthewmueller/io).

## Design

### Pooling

IO-server supports URL-based pooling. For example:

```js
IO.connect('/app/a/1') // gets events from sockets connected to: /app/a/1
IO.connect('/app/a/2') // gets events from sockets connected to: /app/a/2
IO.connect('/app/a') // gets all events from sockets connected to: /app/a/*
IO.connect('/app/b') // gets events from sockets connected to: /app/b
IO.connect('/app') // gets all events from sockets connected to: /app/*
IO.connect('/') // gets all events from all sockets
```

For security purposes, you'll probably want to prevent clients from connecting to root.

> Note: For pooling to work, you'll need to add the `express.query` middleware before engine.io handles the request.

### Event interception

You can catch any event sent to the server by using `IO.on(event)`.

```js
es.on('connection', IO)
IO.on('signup', function(json) {
  json.id = uid;
  this.emit('signup successful', json);
})
```

### Authentication

Authentication is delegated to the middleware level of express. You can stack authentication or validation middleware before engine.io handles the request. See the example below for more information.

## Example

```js
/**
 * Module Dependencies
 */

var express = require('express'),
    engine = require('engine.io'),
    IO = require('io-server'),
    app = express(),
    es = new engine.Server(),
    server = require('http').createServer(app);

/**
 * Handle the upgrade
 */

server.on('upgrade', function(req, socket, head) {
  es.handleUpgrade(req, socket, head);
});

/**
 * Configuration
 */

app.configure(function() {
  app.use(express.logger('dev'));
  app.use(express.query());
  app.use('/engine.io', es.handleRequest.bind(es));
  app.use(express.errorHandler());
});

/**
 * Handle the connection
 */

es.on('connection', IO);

/**
 * Bind to port
 */

server.listen(8080);
console.log('Server started on port 8080');
```

## Tests

Head over to [io](http://github.com/matthewmueller/io) for tests.

## License

(The MIT License)

Copyright (c) 2012 Matthew Mueller &lt;mattmuelle@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
