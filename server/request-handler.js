/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var url = require('url');

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, X-Parse-Application-Id, X-Parse-REST-API-Key',
  'access-control-max-age': 10 // Seconds.
};

var messages = [
// {
//   username: 'Mel Brooks',
//   text: 'Never underestimate the power of the Schwartz! if sorted I should be 2nd',
//   roomname: 'lobby',
//   createdAt: 1,
//   objectId: 0
// }, {
//   username: 'Mel Brooks',
//   text: 'It\'s good to be the king! if sorted I should be first',
//   roomname: 'lobby',
//   createdAt: 2,
//   objectId: 1
// }
];

var lastObjId = 1;

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  headers['Content-Type'] = 'application/json';

  var myURL = url.parse(request.url, true);
  if (myURL.query.order === '-createdAt') {
    var compareFunction = function(a, b) {
      if (a.createdAt > b.createdAt) {
        return -1;
      } else if (a.createdAt < b.createdAt) {
        return 1;
      } else {
        return 0;
      }
    };
    messages.sort(compareFunction);
  }

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.

  if (myURL.pathname !== '/classes/messages') {
    response.writeHead(404, headers);
    response.end('{}');
  } else {
    if (request.method === 'POST') {
      response.writeHead(201, headers);
      var string = '';
      request.setEncoding('utf8');
      request.on('data', function(chunk) {
        string += chunk;
      });
      request.on('end', function() {
        if (request.headers && request.headers['content-type'] === 'application/x-www-form-urlencoded; charset=UTF-8') {
          var msgObj = {};
          var keyValues = string.split('&');
          for (var i = 0; i < keyValues.length; i++) {
            var kvTuple = keyValues[i].split('=');
            kvTuple[1] = kvTuple[1].split('+').join(' ');
            msgObj[kvTuple[0]] = kvTuple[1];
          }
          console.log(msgObj);
        } else {
          var msgObj = JSON.parse(string);
        }
        msgObj.createdAt = new Date();
        lastObjId++;
        msgObj.objectId = lastObjId;
        messages.push(msgObj);
        response.end(JSON.stringify({results: messages}));
      });
    } else if (request.method === 'GET') {
      response.writeHead(200, headers);
      response.end(JSON.stringify({results: messages}));
    } else if (request.method === 'OPTIONS') {
      response.writeHead(200, headers);
      response.end('success');
      console.log('sent out options');
    }
  }

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.


exports.requestHandler = requestHandler;

