'use strict';

var querystring = require('querystring');
var request = require('request');

var printUtils = require('./printer');
var dataUtils = require('./data');
var vizUtils = require('./viz');
var utils = require('./utils');
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

/**
 * Sends parameters to thermal printer after receiving
 * a text message and parsing the text command.
 *
 * Sample text bodies may be:
 * `summary DDMMYYY`
 * 'range DDMMYY-DDMMYY'
 */
exports.print = function(req, res) {
  // var msgBody = 'summary 20160315';
  // var msgBody = 'range 20160318-20160325';
  // var msgBody = req.query.Body.toLowerCase();

  // var command = utils.parseText(req.query.Body);
  var command = utils.parseText(req.query.Body || msgBody);
  console.log(command.mode);

  switch (command.mode) {
    case 'summary':
      dataUtils.retrieveDailyData(command.date, req, function(data){
        // TO DO: Pass data in correct form for image rendering
        data = dataUtils.transformDailyData(data);
        // vizUtils.renderMap();
        printUtils.printDailySummary(req.user.profile.name, data);
        return res.json(data);
      })
      console.log('summary requested', command.date);
      break;
    case 'range':
      dataUtils.retrieveDateRangeData(command.range.from, command.range.to, req, function(data){
        // TO DO: Pass data in correct form for printing
        printUtils.printDateRange(req.user.profile.name, data);
        return res.json(data);
      })
      console.log('date range', command.range.from, command.range.to);
      break;
    default:
      return res.json({
        'status': 'failed',
        'code': 'Incorrect command format'
      })
      break;
  }
}
