// Zac Ioannidis, 2016
'use strict';

var express = require('express');
var Printer = require('thermalprinter');
var serialport = require('serialport');
var dotenv = require('dotenv');
var ngrok = require('ngrok');

var app = express();

// Controller for Express routes
var routes = require('./routes');

// Express configuration
// function init() {
  app.set('port', process.env.PORT || 4567);
  app.get('/test', routes.ping);
// }
// module.exports.init = function() {

// }

// Start Express server
app.listen(app.get('port'), function() {
  console.log('running server on port: ', app.get('port'));
  ngrok.connect(app.get('port'), function (err, url) {
    console.log('ngrok url is: ', url);
  });
});

module.exports = app;
