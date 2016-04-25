'use strict';

var request = require('request');
var querystring = require('querystring');

var SerialPort = require('serialport').SerialPort;
var Printer = require('thermalprinter');
var _ = require('lodash');


// Middleware for passing access tokens to other functions.
// Tokens must be passed when making a request to the Extempore platform.
exports.getTokens = function(req, res, next) {
  var query = querystring.stringify({
    user_id: process.env.USER_ID
  });

  request.get(process.env.SERVER_URL + '/api/authenticate?' + query, function(err,request,body) {
    console.log(process.env.SERVER_URL + '/api/authenticate?' + query);
    if (err) {
      // res.send(err);
      req.user = res.json(err);
      next();
    }
    else {
      // res.send(JSON.parse(body));
      req.user = JSON.parse(body);
      next();
    }
  });
}

exports.ping = function(req, res) {
  res.json(req.user);
};

exports.print = function(req, res) {
  // var serialPort = new SerialPort(process.env.SERIAL_PORT, {
  //   baudrate: 19200
  // })

  // var msgBody = req.query.Body.toLowerCase();
  var msgBody = 'summary';

  switch (msgBody) {
    case 'summary':
      retrieveData("20160424", req, function(data){
        res.json(data);
      })
      console.log('summary requested');
      break;
    case 'viz':
      console.log('abstract visualization');
      break;
    case 'test':
      console.log('everything seems to be working');
      break;
  }

  return;

  // serialPort.on('open',function() {
  //     var printer = new Printer(serialPort);
  //     printer.on('ready', function() {
  //       printer
  //         .horizontalLine(16)
  //         .printLine('first line')
  //         .bold(false)
  //         .inverse(true)
  //         .print(function() {
  //           console.log('done');
  //           res.status(200).json({
  //             'status': 'ok'
  //           });
  //         });
  //   });
  // });
}

// Get data from the various data sources
var retrieveData = function(date, req, cb) {
  // GET SERVER_URL/api/summary/daily/date=xxxx
  var token = _.find(req.user.tokens, {kind: 'moves'}).accessToken;
  console.log(token);
  var baseURL = process.env.SERVER_URL + '/api/summary/daily?from=' + "20160424&to=20160426&token=" + token;
  console.log(baseURL);
  request.get(baseURL, function(err, request, body) {
    if (err) {
      console.log(err);
      return;
    }

    return cb(JSON.parse(body));
  });
}

// Set up Twilio authentication
// Send message to serial
// Get user settings for connected devices

// A user adds their phone number on the settings page
// When a user texts then the number is checked on main API server from DB
// If theres a match with an account and tokens, a response is sent back.

