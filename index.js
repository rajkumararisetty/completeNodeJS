/*
* Primary file for the API
*
*/

// Dependencies

const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const fs = require('fs');
const _data =  require('./lib/data');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

// @TODO Get rid of this
helpers.sendTwilioSms('8142582889', 'Hello!', (error) => {
  console.log('This was the error', error);
});

// Instantiating the HTTP server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});
// Start the HTTP server
httpServer.listen(config.httpPort, () => {
  console.log(`The server is listening on port ${config.httpPort}`);
});

// Instantiating the HTTPS server
const httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});
// Start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
  console.log(`The server is listening on port ${config.httpsPort}`);
});

// All the Server logic for both the HTTP and HTTPS servers
const unifiedServer = (req, res) => {
  // Get the URL and parse it
  const parsedUrl = url.parse(req.url, true);

  // Get the path from the URL
  const path = parsedUrl.pathname;

  // Trimming path to remove slashes from beginning and the end
  const trimmedPath = path.replace(/^\/+|\/+$/g,'');

  // Get the query string as an object
  const queryStringObject = parsedUrl.query;

  // Get the HTTP Method
  const method  = req.method.toLowerCase();

  // Get the headers as an object
  const headers = req.headers;

  // Get the Payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => {
    buffer  += decoder.write(data);
  });
  req.on('end', () => {
    buffer += decoder.end();

    // Choose the handler this request should go to. If one is not found use the  notFound handler
    const chosenHandler = typeof (router[trimmedPath]) !==  'undefined' ? router[trimmedPath] : handlers.notFound;

    //Construct the data object to send to the handler
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      'payload': helpers.parseJsonToObject(buffer)
    };

    // Route the the request specified in the handler
    chosenHandler(data, (statusCode, payload) => {
      // Use the status code called back by the handler or the default to 200
      statusCode = typeof (statusCode) === 'number' ? statusCode : 200;
      // Use the payload called back by the handler or the empty object
      payload = typeof (payload) === 'object' ? payload : {};

      // Convert the payload to string
      const payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log("Returning this response", statusCode, payloadString);
    });
  });
};

// Defining a request router
const router = {
  ping  : handlers.ping,
  users: handlers.users,
  tokens: handlers.tokens,
  checks: handlers.checks
};
