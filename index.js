// Zac Ioannidis, 2016
'use strict';

var express = require('express');
var dotenv = require('dotenv');
var ngrok = require('ngrok');

var app = express();

// Load environmental variables
dotenv.load({ path: '.env' });

// Controller for Express routes
var routes = require('./routes');

// Express configuration
// function init() {
app.set('port', process.env.PORT || 4567);
app.get('/test', routes.getTokens, routes.ping);
app.get('/tokens', routes.getTokens);
app.get('/print', routes.getTokens, routes.print);
// }
// module.exports.init = function() {

// }

// Start Express server
app.listen(app.get('port'), function() {
  console.log('running server on port: ', app.get('port'));
  ngrok.connect(app.get('port'), function (err, url) {
    console.log('ngrok url is: ', url);
    process.env.PROCESS_URL = url;
  });
});

module.exports = app;
